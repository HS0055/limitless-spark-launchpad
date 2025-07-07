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

  // Save cache to localStorage
  const saveCache = () => {
    try {
      localStorage.setItem('translation-cache', JSON.stringify(translationCache.current));
    } catch (error) {
      console.error('Error saving translation cache:', error);
    }
  };

  // Enhanced AI Vision Context Analysis for superior translation accuracy
  const analyzeElementContext = (element: Element): string => {
    const contexts = [];
    
    // Advanced semantic HTML analysis
    const tagName = element.tagName.toLowerCase();
    const semanticTags: Record<string, string> = {
      'h1': 'primary page heading',
      'h2': 'major section heading', 
      'h3': 'subsection heading',
      'h4': 'minor section heading',
      'h5': 'small heading',
      'h6': 'micro heading',
      'p': 'paragraph content',
      'button': 'interactive button',
      'a': 'link or navigation',
      'nav': 'navigation menu',
      'header': 'page header area',
      'footer': 'page footer area',
      'main': 'main page content',
      'aside': 'sidebar content',
      'article': 'article content',
      'section': 'content section',
      'span': 'inline text',
      'div': 'content container',
      'li': 'list item',
      'td': 'table data cell',
      'th': 'table header cell',
      'label': 'form label',
      'title': 'page title',
      'input': 'form input field',
      'textarea': 'text area field',
      'select': 'dropdown selection',
      'option': 'dropdown option',
      'legend': 'form section legend',
      'figcaption': 'image caption',
      'blockquote': 'quoted content',
      'cite': 'citation',
      'time': 'time reference',
      'address': 'contact information'
    };
    
    if (semanticTags[tagName]) {
      contexts.push(semanticTags[tagName]);
    }
    
    // Advanced CSS class and ID analysis
    const className = element.className || '';
    const id = element.id || '';
    
    // UI component detection
    if (className.includes('nav') || id.includes('nav')) contexts.push('navigation component');
    if (className.includes('menu') || id.includes('menu')) contexts.push('menu component');
    if (className.includes('button') || className.includes('btn')) contexts.push('button component');
    if (className.includes('title') || className.includes('heading')) contexts.push('title component');
    if (className.includes('desc') || className.includes('description')) contexts.push('description text');
    if (className.includes('card')) contexts.push('card component');
    if (className.includes('hero')) contexts.push('hero section');
    if (className.includes('footer')) contexts.push('footer section');
    if (className.includes('header')) contexts.push('header section');
    if (className.includes('sidebar')) contexts.push('sidebar section');
    if (className.includes('price') || className.includes('cost')) contexts.push('pricing information');
    if (className.includes('cta') || className.includes('call-to-action')) contexts.push('call-to-action');
    if (className.includes('feature')) contexts.push('feature description');
    if (className.includes('testimonial')) contexts.push('testimonial content');
    if (className.includes('benefit')) contexts.push('benefit statement');
    if (className.includes('service')) contexts.push('service description');
    if (className.includes('product')) contexts.push('product information');
    if (className.includes('contact')) contexts.push('contact information');
    if (className.includes('form')) contexts.push('form element');
    if (className.includes('modal') || className.includes('popup')) contexts.push('modal content');
    if (className.includes('tooltip')) contexts.push('tooltip text');
    if (className.includes('badge') || className.includes('tag')) contexts.push('badge or tag');
    if (className.includes('alert') || className.includes('notification')) contexts.push('alert message');
    if (className.includes('error') || className.includes('warning')) contexts.push('error or warning message');
    if (className.includes('success')) contexts.push('success message');
    if (className.includes('placeholder')) contexts.push('placeholder text');
    if (className.includes('caption')) contexts.push('caption text');
    if (className.includes('copyright')) contexts.push('copyright notice');
    if (className.includes('legal')) contexts.push('legal text');
    if (className.includes('policy')) contexts.push('policy text');
    if (className.includes('terms')) contexts.push('terms text');
    
    // Business context detection
    if (className.includes('business') || id.includes('business')) contexts.push('business content');
    if (className.includes('marketing') || id.includes('marketing')) contexts.push('marketing content');
    if (className.includes('finance') || id.includes('finance')) contexts.push('financial content');
    if (className.includes('education') || id.includes('education')) contexts.push('educational content');
    if (className.includes('learning') || id.includes('learning')) contexts.push('learning content');
    if (className.includes('course') || id.includes('course')) contexts.push('course content');
    if (className.includes('program') || id.includes('program')) contexts.push('program content');
    if (className.includes('league') || id.includes('league')) contexts.push('league content');
    
    // Position-based context analysis
    try {
      const rect = element.getBoundingClientRect();
      if (rect.top < 200) contexts.push('above-the-fold content');
      if (rect.top > window.innerHeight - 200) contexts.push('below-the-fold content');
      if (rect.left < 100) contexts.push('left-aligned content');
      if (rect.right > window.innerWidth - 100) contexts.push('right-aligned content');
      if (rect.width > window.innerWidth * 0.8) contexts.push('full-width content');
    } catch (e) {
      // Skip if getBoundingClientRect fails
    }
    
    // Hierarchical context analysis
    let parent = element.parentElement;
    let depth = 0;
    while (parent && parent !== document.body && depth < 8) {
      const parentTag = parent.tagName.toLowerCase();
      const parentClass = parent.className || '';
      
      if (parentTag === 'nav') contexts.push('within navigation');
      if (parentTag === 'header') contexts.push('within header');
      if (parentTag === 'footer') contexts.push('within footer');
      if (parentTag === 'main') contexts.push('within main content');
      if (parentTag === 'aside') contexts.push('within sidebar');
      if (parentTag === 'article') contexts.push('within article');
      if (parentTag === 'section') contexts.push('within section');
      if (parentTag === 'form') contexts.push('within form');
      if (parentTag === 'table') contexts.push('within table');
      if (parentTag === 'ul' || parentTag === 'ol') contexts.push('within list');
      
      if (parentClass.includes('hero')) contexts.push('within hero section');
      if (parentClass.includes('features')) contexts.push('within features section');
      if (parentClass.includes('testimonials')) contexts.push('within testimonials section');
      if (parentClass.includes('pricing')) contexts.push('within pricing section');
      if (parentClass.includes('about')) contexts.push('within about section');
      if (parentClass.includes('contact')) contexts.push('within contact section');
      if (parentClass.includes('services')) contexts.push('within services section');
      if (parentClass.includes('products')) contexts.push('within products section');
      if (parentClass.includes('team')) contexts.push('within team section');
      if (parentClass.includes('blog')) contexts.push('within blog section');
      if (parentClass.includes('news')) contexts.push('within news section');
      if (parentClass.includes('events')) contexts.push('within events section');
      if (parentClass.includes('gallery')) contexts.push('within gallery section');
      if (parentClass.includes('portfolio')) contexts.push('within portfolio section');
      
      parent = parent.parentElement;
      depth++;
    }
    
    // ARIA and accessibility context
    const ariaRole = element.getAttribute('role');
    if (ariaRole) contexts.push(`${ariaRole} role`);
    
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) contexts.push('accessibility label');
    
    const ariaDescribedBy = element.getAttribute('aria-describedby');
    if (ariaDescribedBy) contexts.push('accessibility description');
    
    // Data attributes for additional context
    for (const attr of element.attributes) {
      if (attr.name.startsWith('data-') && attr.value) {
        if (attr.name.includes('type')) contexts.push(`${attr.value} type`);
        if (attr.name.includes('category')) contexts.push(`${attr.value} category`);
        if (attr.name.includes('section')) contexts.push(`${attr.value} section`);
      }
    }
    
    return contexts.length > 0 ? contexts.join(', ') : 'general web content';
  };

  const extractTextContent = (element: Element): Array<{ element: Element; text: string; context: string }> => {
    const textElements: Array<{ element: Element; text: string; context: string }> = [];
    
    // Ultra-comprehensive content detection system
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            
            // Skip only essential non-translatable content
            const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE'];
            if (skipTags.includes(parent.tagName)) {
              return NodeFilter.FILTER_REJECT;
            }
            
            // Skip completely hidden elements
            const style = window.getComputedStyle(parent);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
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
            
            // More comprehensive filtering - capture almost all text content
            if (/^\s*$/.test(text) || // Empty/whitespace only
                /^[\d\s\.,\-\+\(\)\[\]%]*$/.test(text) && text.length < 3 || // Short numbers/symbols only
                /^https?:\/\//.test(text) || // URLs
                /^[^\s]+@[^\s]+\.[^\s]+$/.test(text) || // Emails
                /^[A-Z_][A-Z0-9_]*$/.test(text) && text.length > 8 || // Long constants only
                text.startsWith('//') || text.startsWith('/*') || // Comments
                /^\$\{/.test(text) || // Template literals
                /^[{}[\]()<>/\\]+$/.test(text) // Pure brackets/symbols
            ) {
              return NodeFilter.FILTER_REJECT;
            }
            
            return NodeFilter.FILTER_ACCEPT;
          }
          
          // Enhanced element attribute detection
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Comprehensive translatable attributes
            const translatableAttrs = [
              'title', 'alt', 'placeholder', 'aria-label', 'aria-description',
              'data-tooltip', 'data-title', 'label', 'value'
            ];
            
            for (const attr of translatableAttrs) {
              const value = element.getAttribute(attr);
              if (value && value.trim().length > 1 && !/^[0-9]+$/.test(value)) {
                return NodeFilter.FILTER_ACCEPT;
              }
            }
            
            // Check for pseudo-elements with content
            const computedStyle = window.getComputedStyle(element, '::before');
            const beforeContent = computedStyle.getPropertyValue('content');
            if (beforeContent && beforeContent !== 'none' && beforeContent !== '""') {
              return NodeFilter.FILTER_ACCEPT;
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
          
          // Always add text nodes - let the translation API decide if it's translatable
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
            // Store original content for restoration
            if (!originalContent.current.has(parent)) {
              originalContent.current.set(parent, parent.textContent || '');
            }
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Handle translatable attributes more comprehensively
        const element = node as Element;
        const translatableAttrs = [
          'title', 'alt', 'placeholder', 'aria-label', 'aria-description',
          'data-tooltip', 'data-title', 'label', 'value'
        ];
        
        for (const attr of translatableAttrs) {
          const value = element.getAttribute(attr);
          if (value && value.trim().length > 0 && !/^[0-9]+$/.test(value)) {
            const elementContext = analyzeElementContext(element);
            textElements.push({
              element: element,
              text: value,
              context: `${elementContext}, ${attr} attribute`
            });
            
            // Store original attribute value
            const cacheKey = `${element.tagName}-${attr}`;
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
    // Check cache first for ultra-fast retrieval
    const cacheKey = `${text.toLowerCase().trim()}_${context || ''}`;
    if (translationCache.current[cacheKey]?.[targetLang]) {
      return translationCache.current[cacheKey][targetLang];
    }

    try {
      // Use optimized API client with caching and deduplication
      const result = await apiClient.invoke('ai-translate', {
        body: {
          text: text,
          sourceLang: 'en',
          targetLang: targetLang,
          context: context,
          visionMode: true
        }
      }, {
        ttl: 300000, // 5 minute cache
        skipCache: false
      });

      if (result.error) throw result.error;

      const translatedText = result.data.translatedText;

      // Enhanced aggressive caching with context
      if (!translationCache.current[cacheKey]) {
        translationCache.current[cacheKey] = {};
      }
      translationCache.current[cacheKey][targetLang] = translatedText;
      
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
    
    if (alreadyTranslated && !force && hasTranslatedOnce) {
      return; // Silent return, no notification for auto-mode
    }

    translationInProgress.current = true;
    setIsTranslating(true);
    setTranslationProgress(0);
    
    const startTime = Date.now();

    try {
      // Extract all text content from the page with improved detection
      const textElements = extractTextContent(document.body);
      
      if (textElements.length === 0) {
        return;
      }

      // Smart caching - prioritize frequently used phrases
      const uncachedTexts = textElements.filter(({ text, context }) => {
        const cacheKey = `${text.toLowerCase()}_${context || ''}`;
        return !translationCache.current[cacheKey]?.[targetLang];
      });

      // Ultra-fast parallel processing for Claude 4
      const batchSize = Math.min(uncachedTexts.length > 100 ? 5 : 8, textElements.length);
      let completed = 0;
      
      // Process in optimized parallel batches
      for (let i = 0; i < textElements.length; i += batchSize) {
        const batch = textElements.slice(i, i + batchSize);
        
        // AI Vision-Enhanced parallel processing with comprehensive updates
        await Promise.allSettled(
          batch.map(async ({ element, text, context }) => {
            try {
              const translatedText = await translateText(text, targetLang, context);
              
                // Comprehensive element update system
                if (element) {
                  try {
                    // Check if this is an attribute translation
                    if (context.includes('attribute')) {
                      const attrMatch = context.match(/(title|alt|placeholder|aria-label|aria-description|data-tooltip|data-title|label|value) attribute/);
                      if (attrMatch) {
                        const attrName = attrMatch[1];
                        const currentValue = element.getAttribute(attrName);
                        if (currentValue && (currentValue === text || currentValue.trim() === text.trim())) {
                          element.setAttribute(attrName, translatedText);
                        }
                      }
                    } else {
                      // Handle text content with multiple strategies
                      const currentText = element.textContent?.trim();
                      const originalText = text.trim();
                      
                      // Strategy 1: Direct text content match
                      if (currentText === originalText) {
                        element.textContent = translatedText;
                      }
                      // Strategy 2: Partial content match
                      else if (currentText && currentText.includes(originalText)) {
                        const newContent = currentText.replace(originalText, translatedText);
                        element.textContent = newContent;
                      }
                      // Strategy 3: HTML content with text preservation
                      else if (element.innerHTML && element.innerHTML.includes(originalText)) {
                        // Preserve HTML structure while replacing text
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = element.innerHTML;
                        const walker = document.createTreeWalker(
                          tempDiv,
                          NodeFilter.SHOW_TEXT,
                          null
                        );
                        
                        let textNode;
                        while (textNode = walker.nextNode()) {
                          if (textNode.textContent?.trim() === originalText) {
                            textNode.textContent = translatedText;
                            break;
                          }
                        }
                        element.innerHTML = tempDiv.innerHTML;
                      }
                      // Strategy 4: Direct text node replacement
                      else {
                        const walker = document.createTreeWalker(
                          element,
                          NodeFilter.SHOW_TEXT,
                          null
                        );
                        
                        let textNode;
                        while (textNode = walker.nextNode()) {
                          if (textNode.textContent?.trim() === originalText) {
                            textNode.textContent = translatedText;
                            break;
                          }
                        }
                      }
                    }
                  } catch (error) {
                    // Fallback: simple text replacement
                    if (!context.includes('attribute') && element.textContent?.includes(text)) {
                      element.textContent = element.textContent.replace(text, translatedText);
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
        
        // Minimal delay for Claude's fast processing
        if (i + batchSize < textElements.length) {
          await new Promise(resolve => setTimeout(resolve, 25));
        }
      }

      // Mark page as translated for this session
      sessionStorage.setItem(sessionKey, 'true');
      setHasTranslatedOnce(true);

      // Show success only on manual trigger (admin-only logging)
      if (force && hasAdminRole) {
        logToAdmin('Translation completed', {
          targetLang,
          elementsTranslated: textElements.length,
          duration: Date.now() - startTime
        });
      }

    } catch (error) {
      // Admin-only error logging
      if (hasAdminRole) {
        logToAdmin('Translation error', { error: (error as Error).message, targetLang });
      }
    } finally {
      setIsTranslating(false);
      setTranslationProgress(0);
      translationInProgress.current = false;
      // Auto-hide status after 1 second
      setTimeout(() => setTranslationStatus(null), 1000);
    }
  };

  // Enhanced status system instead of intrusive popups
  const [translationStatus, setTranslationStatus] = useState<{
    message: string;
    type: 'info' | 'loading' | 'success' | 'error' | 'warning';
  } | null>(null);

  const showTranslationStatus = (message: string, type: 'info' | 'loading' | 'success' | 'error' | 'warning') => {
    // Silent mode - no popups, but still track status for debugging
    if (hasAdminRole) {
      setTranslationStatus({ message, type });
      // Auto-hide after 1 second for admin debugging
      setTimeout(() => setTranslationStatus(null), 1000);
    }
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

    // Intelligent auto-translation with delay
    const timer = setTimeout(() => {
      translatePage(language);
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

      {/* Admin-only debug status */}
      {hasAdminRole && translationStatus && (
        <div className="fixed top-16 right-4 z-50 max-w-xs">
          <div className={`
            px-2 py-1 rounded-md backdrop-blur-sm shadow-md border text-xs transition-all duration-300 transform
            ${translationStatus.type === 'success' ? 'bg-green-500/60 border-green-400/30 text-white' : ''}
            ${translationStatus.type === 'error' ? 'bg-red-500/60 border-red-400/30 text-white' : ''}
            ${translationStatus.type === 'warning' ? 'bg-yellow-500/60 border-yellow-400/30 text-white' : ''}
            ${translationStatus.type === 'info' ? 'bg-blue-500/60 border-blue-400/30 text-white' : ''}
            ${translationStatus.type === 'loading' ? 'bg-primary/60 border-primary/30 text-primary-foreground' : ''}
            animate-slide-in-right opacity-70
          `}>
            <div className="flex items-center gap-1">
              {translationStatus.type === 'loading' && (
                <div className="animate-spin w-2 h-2 border border-current border-t-transparent rounded-full"></div>
              )}
              <span className="text-[10px] font-medium">{translationStatus.message}</span>
            </div>
          </div>
        </div>
      )}
      
      {children}
    </>
  );
};