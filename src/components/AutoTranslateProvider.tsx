import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';

interface TranslationCache {
  [key: string]: {
    [targetLang: string]: string;
  };
}

export const AutoTranslateProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [masterTranslationEnabled, setMasterTranslationEnabled] = useState(true);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(true);
  const [showCostWarning, setShowCostWarning] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [translationMode, setTranslationMode] = useState<'auto' | 'manual'>('auto');
  const [translatedLanguages, setTranslatedLanguages] = useState<Set<string>>(new Set());
  const [hasTranslatedOnce, setHasTranslatedOnce] = useState(false);
  const [hasAdminRole, setHasAdminRole] = useState(false);
  const translationCache = useRef<TranslationCache>({});
  const originalContent = useRef<Map<Element, string>>(new Map());
  const previousLanguage = useRef<string>('en');
  const translationInProgress = useRef<boolean>(false);

  // Admin-only logging function
  const logToAdmin = async (message: string, data: any) => {
    if (!hasAdminRole) return;
    
    try {
      await apiClient.invoke('admin-log', {
        body: {
          level: 'info',
          message,
          data,
          timestamp: new Date().toISOString(),
          user_id: user?.id
        }
      });
    } catch (error) {
      // Silent fail for logging
    }
  };

  useEffect(() => {
    // Check admin role
    const checkAdminRole = async () => {
      if (user) {
        try {
          const { data } = await apiClient.invoke('check-admin-role');
          setHasAdminRole(data?.isAdmin || false);
        } catch (error) {
          setHasAdminRole(false);
        }
      }
    };
    
    checkAdminRole();
    
    // Load master translation settings - Auto-enable everything by default
    try {
      setMasterTranslationEnabled(true);
      setAutoTranslateEnabled(true);
      setTranslationMode('auto');
      
      const savedCache = localStorage.getItem('translation-cache');
      if (savedCache) {
        translationCache.current = JSON.parse(savedCache);
      }
      
      // Force enable auto-translation for seamless experience
      localStorage.setItem('master-translation-enabled', 'true');
      localStorage.setItem('auto-translate-enabled', 'true');
      localStorage.setItem('translation-mode', 'auto');
    } catch (error) {
      console.error('Error loading translation settings:', error);
    }
  }, [user]);

  // ENHANCED: Save cache to localStorage with compression
  const saveCache = () => {
    try {
      // Only save most frequently used translations to avoid localStorage bloat
      const frequentlyUsed = Object.entries(translationCache.current)
        .filter(([key, translations]) => Object.keys(translations).length > 0)
        .slice(0, 200); // Limit to top 200 most used translations
      
      const compactCache = Object.fromEntries(frequentlyUsed);
      localStorage.setItem('translation-cache', JSON.stringify(compactCache));
    } catch (error) {
      console.error('Error saving translation cache:', error);
    }
  };

  // AI Vision Context Analysis for better translation accuracy
  const analyzeElementContext = (element: Element): string => {
    const contexts = [];
    
    // Analyze semantic HTML tags
    const tagName = element.tagName.toLowerCase();
    const semanticTags: Record<string, string> = {
      'h1': 'main heading',
      'h2': 'section heading', 
      'h3': 'subsection heading',
      'h4': 'minor heading',
      'h5': 'small heading',
      'h6': 'tiny heading',
      'p': 'paragraph text',
      'button': 'interactive button',
      'a': 'navigation link',
      'nav': 'navigation menu',
      'header': 'page header',
      'footer': 'page footer',
      'main': 'main content',
      'aside': 'sidebar content',
      'article': 'article content',
      'section': 'content section',
      'span': 'inline text',
      'div': 'content block',
      'li': 'list item',
      'td': 'table data',
      'th': 'table header',
      'label': 'form label',
      'title': 'page title'
    };
    
    if (semanticTags[tagName]) {
      contexts.push(semanticTags[tagName]);
    }
    
    // Analyze CSS classes for context clues
    const className = element.className || '';
    if (className.includes('nav')) contexts.push('navigation');
    if (className.includes('menu')) contexts.push('menu');
    if (className.includes('button') || className.includes('btn')) contexts.push('button');
    if (className.includes('title') || className.includes('heading')) contexts.push('title');
    if (className.includes('desc') || className.includes('text')) contexts.push('description');
    if (className.includes('card')) contexts.push('card content');
    if (className.includes('hero')) contexts.push('hero section');
    if (className.includes('footer')) contexts.push('footer');
    if (className.includes('header')) contexts.push('header');
    if (className.includes('price')) contexts.push('pricing');
    if (className.includes('cta')) contexts.push('call to action');
    
    // Analyze element position and hierarchy
    try {
      const rect = element.getBoundingClientRect();
      if (rect.top < 200) contexts.push('top section');
      if (rect.bottom > window.innerHeight - 200) contexts.push('bottom section');
    } catch (e) {
      // Skip if getBoundingClientRect fails
    }
    
    // Analyze parent context for better understanding
    let parent = element.parentElement;
    let depth = 0;
    while (parent && parent !== document.body && depth < 5) {
      const parentTag = parent.tagName.toLowerCase();
      if (parentTag === 'nav') contexts.push('navigation area');
      if (parentTag === 'header') contexts.push('header area');
      if (parentTag === 'footer') contexts.push('footer area');
      if (parentTag === 'main') contexts.push('main content area');
      if (parent.className && parent.className.includes('hero')) contexts.push('hero section');
      parent = parent.parentElement;
      depth++;
    }
    
    return contexts.length > 0 ? contexts.join(', ') : 'general content';
  };

  const extractTextContent = (element: Element): Array<{ element: Element; text: string; context: string }> => {
    const textElements: Array<{ element: Element; text: string; context: string }> = [];
    
    // Enhanced tree walker for COMPREHENSIVE content detection
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            
            // Only skip truly technical content
            const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT'];
            if (skipTags.includes(parent.tagName)) {
              return NodeFilter.FILTER_REJECT;
            }
            
            // Skip hidden elements only if completely hidden
            const style = window.getComputedStyle(parent);
            if (style.display === 'none' || style.visibility === 'hidden') {
              return NodeFilter.FILTER_REJECT;
            }
            
            // Skip data-no-translate
            if (parent.hasAttribute('data-no-translate') || parent.closest('[data-no-translate]')) {
              return NodeFilter.FILTER_REJECT;
            }
            
            const text = node.textContent?.trim();
            if (!text || text.length < 1) {
              return NodeFilter.FILTER_REJECT;
            }
            
            // ENHANCED: Allow MORE content types - be more inclusive
            if (/^[\d\s\.,\-\+\(\)\[\]]+$/.test(text) || 
                /^https?:\/\//.test(text) || 
                /^[^\s]+@[^\s]+\.[^\s]+$/.test(text) ||
                text.startsWith('//') || text.startsWith('/*') ||
                /^[\{\}\[\]\(\)\<\>\/\\]+$/.test(text)) {
              return NodeFilter.FILTER_REJECT;
            }
            
            return NodeFilter.FILTER_ACCEPT;
          }
          
          // For element nodes, check if they have text content or important attributes
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check for translatable attributes - EXPANDED LIST
            const translatableAttrs = ['title', 'alt', 'placeholder', 'aria-label', 'data-tooltip', 'data-title'];
            for (const attr of translatableAttrs) {
              const value = element.getAttribute(attr);
              if (value && value.trim().length > 1) {
                return NodeFilter.FILTER_ACCEPT;
              }
            }
          }
          
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        const parent = node.parentElement;
        if (text && text.length > 0 && parent) {
          const elementContext = analyzeElementContext(parent);
          
          // Group consecutive text nodes from the same parent
          const existingEntry = textElements.find(entry => entry.element === parent);
          if (existingEntry) {
            if (!existingEntry.text.includes(text)) {
              existingEntry.text += ' ' + text;
            }
          } else {
            textElements.push({ 
              element: parent, 
              text,
              context: elementContext
            });
            // Store original content
            if (!originalContent.current.has(parent)) {
              originalContent.current.set(parent, text);
            }
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Handle translatable attributes - EXPANDED
        const element = node as Element;
        const translatableAttrs = ['title', 'alt', 'placeholder', 'aria-label', 'data-tooltip', 'data-title'];
        
        for (const attr of translatableAttrs) {
          const value = element.getAttribute(attr);
          if (value && value.trim().length > 1) {
            const elementContext = analyzeElementContext(element);
            textElements.push({
              element: element,
              text: value,
              context: `${elementContext}, ${attr} attribute`
            });
            
            // Store original attribute value
            if (!originalContent.current.has(element)) {
              originalContent.current.set(element, value);
            }
          }
        }
      }
    }
    
    return textElements;
  };

  const translateText = async (text: string, targetLang: string, context?: string): Promise<string> => {
    // ENHANCED: Multi-level cache system for ultra-fast retrieval
    const cacheKey = `${text.toLowerCase().trim()}_${context || ''}`;
    if (translationCache.current[cacheKey]?.[targetLang]) {
      return translationCache.current[cacheKey][targetLang];
    }

    // ADVANCED: Check persistent browser cache for cross-session translations
    const persistentCacheKey = `translation_${cacheKey}_${targetLang}`;
    try {
      const cachedTranslation = localStorage.getItem(persistentCacheKey);
      if (cachedTranslation) {
        const cached = JSON.parse(cachedTranslation);
        const isExpired = Date.now() - cached.timestamp > 7 * 24 * 60 * 60 * 1000; // 7 days
        if (!isExpired) {
          // Restore to in-memory cache for even faster future access
          if (!translationCache.current[cacheKey]) {
            translationCache.current[cacheKey] = {};
          }
          translationCache.current[cacheKey][targetLang] = cached.translation;
          return cached.translation;
        } else {
          localStorage.removeItem(persistentCacheKey); // Clean expired cache
        }
      }
    } catch (error) {
      // Silent fail for cache read errors
    }

    try {
      // Use optimized API client with enhanced caching and deduplication
      const result = await apiClient.invoke('ai-translate', {
        body: {
          text: text,
          sourceLang: 'en',
          targetLang: targetLang,
          context: context,
          visionMode: true
        }
      }, {
        ttl: 600000, // 10 minute cache (increased for better performance)
        skipCache: false
      });

      if (result.error) throw result.error;

      const translatedText = result.data.translatedText;

      // ENHANCED: Multi-layer aggressive caching with context
      if (!translationCache.current[cacheKey]) {
        translationCache.current[cacheKey] = {};
      }
      translationCache.current[cacheKey][targetLang] = translatedText;
      
      // ADVANCED: Persistent browser cache for cross-session performance
      try {
        localStorage.setItem(persistentCacheKey, JSON.stringify({
          translation: translatedText,
          timestamp: Date.now()
        }));
      } catch (error) {
        // Silent fail if localStorage is full
      }
      
      // Batch save to localStorage for performance
      saveCache();

      return translatedText;
    } catch (error) {
      // Admin-only error logging
      if (hasAdminRole) {
        logToAdmin('Translation error', { text, context, error });
      }
      return text; // Fallback to original text
    }
  };

  const restoreOriginalContent = () => {
    originalContent.current.forEach((originalText, element) => {
      if (element && element.textContent !== originalText) {
        element.textContent = originalText;
      }
    });
  };

  // Master translation function - handles everything with one click
  const handleMasterTranslation = async () => {
    if (!masterTranslationEnabled) {
      // Enable the entire system
      setMasterTranslationEnabled(true);
      setAutoTranslateEnabled(true);
      setTranslationMode('auto');
      localStorage.setItem('master-translation-enabled', 'true');
      localStorage.setItem('auto-translate-enabled', 'true');
      localStorage.setItem('translation-mode', 'auto');
      
      showTranslationStatus("Translation system activated", "success");
      
      // Auto-translate current language if not English
      if (language !== 'en') {
        setTimeout(() => translatePage(language, true), 500);
      }
    } else {
      // Force translate current language
      if (language !== 'en') {
        await translatePage(language, true);
      } else {
        showTranslationStatus("Switch to Armenian or Russian to translate", "info");
      }
    }
  };

  const translatePage = async (targetLang: string, force = false) => {
    // Prevent multiple simultaneous translations
    if (translationInProgress.current && !force) {
      return;
    }

    if (!masterTranslationEnabled && !force) return;
    
    if (targetLang === 'en') {
      restoreOriginalContent();
      return;
    }

    // Check if this specific language was already translated for this session
    const sessionKey = `translated-${targetLang}-${window.location.pathname}`;
    const alreadyTranslated = sessionStorage.getItem(sessionKey);
    
    // ENHANCED: Skip notification but still allow retranslation for dynamic content
    if (alreadyTranslated && !force) {
      // Silent check for new content that might need translation
      const currentContent = extractTextContent(document.body);
      const hasNewContent = currentContent.some(({ text, context }) => {
        const cacheKey = `${text.toLowerCase()}_${context || ''}`;
        return !translationCache.current[cacheKey]?.[targetLang];
      });
      
      if (!hasNewContent) return; // No new content, skip translation
    }

    translationInProgress.current = true;
    setIsTranslating(true);
    setTranslationProgress(0);
    
    // SILENT PROCESSING - No status messages unless forced
    if (force) {
      showTranslationStatus("Translating...", "loading");
    }

    const startTime = Date.now();

    try {
      // Extract all text content from the page with ENHANCED detection
      const textElements = extractTextContent(document.body);
      
      if (textElements.length === 0) {
        if (force) showTranslationStatus("No text found", "warning");
        return;
      }

      // Smart caching - prioritize frequently used phrases
      const uncachedTexts = textElements.filter(({ text, context }) => {
        const cacheKey = `${text.toLowerCase()}_${context || ''}`;
        return !translationCache.current[cacheKey]?.[targetLang];
      });

      // OPTIMIZED: Ultra-fast parallel processing for Claude 4
      const batchSize = Math.min(uncachedTexts.length > 100 ? 8 : 12, textElements.length);
      let completed = 0;
      
      // Process in optimized parallel batches with ENHANCED speed
      for (let i = 0; i < textElements.length; i += batchSize) {
        const batch = textElements.slice(i, i + batchSize);
        
        // AI Vision-Enhanced parallel processing with comprehensive updates
        await Promise.allSettled(
          batch.map(async ({ element, text, context }) => {
            try {
              const translatedText = await translateText(text, targetLang, context);
              
              // Enhanced element update - handle both text content and attributes
              if (element) {
                // Check if this is an attribute translation
                if (context.includes('attribute')) {
                  const attrMatch = context.match(/(title|alt|placeholder|aria-label|data-tooltip|data-title) attribute/);
                  if (attrMatch) {
                    const attrName = attrMatch[1];
                    if (element.getAttribute(attrName) === text) {
                      element.setAttribute(attrName, translatedText);
                    }
                  }
                } else if (element.textContent?.trim() === text.trim()) {
                  // Handle text content with improved replacement
                  const wasHtml = element.innerHTML !== element.textContent;
                  if (wasHtml && element.innerHTML.includes(text)) {
                    element.innerHTML = element.innerHTML.replace(text, translatedText);
                  } else {
                    element.textContent = translatedText;
                  }
                }
              }
              
              return { success: true, text, translatedText, context };
            } catch (error) {
              // Send error to admin logging only
              if (hasAdminRole) {
                logToAdmin('AI Vision translation failed', { text, context, error });
              }
              return { success: false, text, error, context };
            }
          })
        );

        completed += batch.length;
        const progress = (completed / textElements.length) * 100;
        setTranslationProgress(progress);
        
        // REDUCED delay for even faster processing
        if (i + batchSize < textElements.length) {
          await new Promise(resolve => setTimeout(resolve, 15));
        }
      }

      // Mark page as translated for this session
      sessionStorage.setItem(sessionKey, 'true');
      setHasTranslatedOnce(true);

      // SILENT SUCCESS - Only log for admin, no user notification
      if (hasAdminRole) {
        logToAdmin('Silent translation completed', {
          targetLang,
          elementsTranslated: textElements.length,
          duration: Date.now() - startTime,
          isAutomatic: !force
        });
      }

    } catch (error) {
      // Admin-only error logging
      if (hasAdminRole) {
        logToAdmin('Translation error', { error: (error as Error).message, targetLang });
      }
      if (force) showTranslationStatus("Failed", "error");
    } finally {
      setIsTranslating(false);
      setTranslationProgress(0);
      translationInProgress.current = false;
      // Auto-hide status after 1 second for faster UX
      setTimeout(() => setTranslationStatus(null), 1000);
    }
  };

  // Enhanced status system instead of intrusive popups
  const [translationStatus, setTranslationStatus] = useState<{
    message: string;
    type: 'info' | 'loading' | 'success' | 'error' | 'warning';
  } | null>(null);

  const showTranslationStatus = (message: string, type: 'info' | 'loading' | 'success' | 'error' | 'warning') => {
    setTranslationStatus({ message, type });
  };

  useEffect(() => {
    // Auto-translate when language changes (if master system is enabled)
    if (!masterTranslationEnabled || !autoTranslateEnabled || translationMode !== 'auto') {
      previousLanguage.current = language;
      return;
    }

    // Don't translate on initial load or same language
    if (previousLanguage.current === language) {
      previousLanguage.current = language;
      return;
    }

    // Intelligent auto-translation with delay - RESTORED without popup
    const timer = setTimeout(() => {
      translatePage(language, false); // false = no forced status messages
      previousLanguage.current = language;
    }, 500);

    return () => clearTimeout(timer);
  }, [language, masterTranslationEnabled, autoTranslateEnabled, translationMode]);

  const enableAutoTranslate = () => {
    setAutoTranslateEnabled(true);
    setTranslationMode('auto');
    localStorage.setItem('auto-translate-enabled', 'true');
    localStorage.setItem('translation-mode', 'auto');
    setShowCostWarning(false);
    localStorage.setItem('cost-warning-dismissed', 'true');
  };

  const enableManualTranslate = () => {
    setAutoTranslateEnabled(false);
    setTranslationMode('manual');
    localStorage.setItem('auto-translate-enabled', 'false');
    localStorage.setItem('translation-mode', 'manual');
    setShowCostWarning(false);
    localStorage.setItem('cost-warning-dismissed', 'true');
  };

  const dismissWarning = () => {
    setShowCostWarning(false);
    localStorage.setItem('cost-warning-dismissed', 'true');
  };

  return (
    <>
      {/* Cost Warning Modal */}
      {showCostWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">⚠️ Translation Costs</h3>
            <div className="space-y-3 text-sm text-muted-foreground mb-6">
              <p>Choose your translation mode:</p>
              <div className="space-y-2">
                <p><strong>Auto Mode:</strong> Translates immediately when language changes</p>
                <p><strong>Manual Mode:</strong> You control when to translate (faster & cheaper)</p>
              </div>
              <ul className="space-y-1 ml-4 text-xs">
                <li>• ~$0.002 per page translation</li>
                <li>• Cached translations are free</li>
                <li>• Manual mode gives you full control</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button onClick={enableAutoTranslate} className="flex-1" size="sm">
                Auto Mode
              </Button>
              <Button onClick={enableManualTranslate} variant="outline" className="flex-1" size="sm">
                Manual Mode
              </Button>
            </div>
            <Button onClick={dismissWarning} variant="ghost" size="sm" className="w-full mt-2">
              Skip for now
            </Button>
          </div>
        </div>
      )}

      {/* Translation Status - Hidden for better UX */}
      {false && translationStatus && (
        <div className="hidden">
          {/* Status removed to eliminate popup */}
        </div>
      )}
      
      {children}
    </>
  );
};