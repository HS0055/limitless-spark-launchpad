import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface TranslationCache {
  [key: string]: {
    [targetLang: string]: string;
  };
}

export const AutoTranslateProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [masterTranslationEnabled, setMasterTranslationEnabled] = useState(true);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(true); // Enable by default
  const [showCostWarning, setShowCostWarning] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [translationMode, setTranslationMode] = useState<'auto' | 'manual'>('auto'); // Auto by default
  const [translatedLanguages, setTranslatedLanguages] = useState<Set<string>>(new Set());
  const [hasTranslatedOnce, setHasTranslatedOnce] = useState(false);
  const translationCache = useRef<TranslationCache>({});
  const originalContent = useRef<Map<Element, string>>(new Map());
  const previousLanguage = useRef<string>('en');
  const translationInProgress = useRef<boolean>(false);

  useEffect(() => {
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
  }, []);

  // Save cache to localStorage
  const saveCache = () => {
    try {
      localStorage.setItem('translation-cache', JSON.stringify(translationCache.current));
    } catch (error) {
      console.error('Error saving translation cache:', error);
    }
  };

  const extractTextContent = (element: Element): Array<{ element: Element; text: string; context: string }> => {
    const textElements: Array<{ element: Element; text: string; context: string }> = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          // AI Vision-enhanced detection - capture ALL meaningful content
          const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'PATH'];
          if (skipTags.includes(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Only skip truly hidden elements, not opacity/transform effects
          const style = window.getComputedStyle(parent);
          if (style.display === 'none' || style.visibility === 'hidden') {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Skip elements with data-no-translate attribute
          if (parent.hasAttribute('data-no-translate') || parent.closest('[data-no-translate]')) {
            return NodeFilter.FILTER_REJECT;
          }
          
          const text = node.textContent?.trim();
          if (!text || text.length < 1) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Enhanced filtering - preserve MORE content for comprehensive translation
          // Only reject pure technical/code content
          if (/^[\d\s\.,\-\+\(\)\[\]]+$/.test(text) || 
              /^https?:\/\//.test(text) || 
              /^[^\s]+@[^\s]+\.[^\s]+$/.test(text) ||
              /^[0-9]+(\.[0-9]+)*$/.test(text) ||
              /^[\{\}\[\]\(\)\<\>\/\\]+$/.test(text) ||
              text.startsWith('//') || text.startsWith('/*')) {
            return NodeFilter.FILTER_REJECT;
          }
          
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent?.trim();
      const parent = node.parentElement;
      if (text && text.length > 0 && parent) {
        // AI Vision Context Detection - Enhanced element analysis
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
          // Store original content if not already stored
          if (!originalContent.current.has(parent)) {
            originalContent.current.set(parent, text);
          }
        }
      }
    }
    
    return textElements;
  };

  // AI Vision Context Analysis for better translation accuracy
  const analyzeElementContext = (element: Element): string => {
    const contexts = [];
    
    // Analyze semantic HTML tags
    const tagName = element.tagName.toLowerCase();
    const semanticTags = {
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
      console.error('AI Vision translation error:', error);
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
    showTranslationStatus("Translating...", "loading");

    try {
      // Extract all text content from the page with improved detection
      const textElements = extractTextContent(document.body);
      
      if (textElements.length === 0) {
        showTranslationStatus("No text found", "warning");
        return;
      }

      // Smart caching - prioritize frequently used phrases
      const uncachedTexts = textElements.filter(({ text }) => {
        const cacheKey = text.toLowerCase();
        return !translationCache.current[cacheKey]?.[targetLang];
      });

      // Ultra-fast parallel processing for Claude 4
      const batchSize = Math.min(uncachedTexts.length > 100 ? 5 : 8, textElements.length); // Larger batches for Claude
      let completed = 0;
      
      // Process in optimized parallel batches
      for (let i = 0; i < textElements.length; i += batchSize) {
        const batch = textElements.slice(i, i + batchSize);
        
        // AI Vision-Enhanced parallel processing
        const results = await Promise.allSettled(
          batch.map(async ({ element, text, context }) => {
            try {
              const translatedText = await translateText(text, targetLang, context);
              
              // Intelligent element update with context awareness
              if (element && element.textContent?.trim() === text.trim()) {
                const wasHtml = element.innerHTML !== element.textContent;
                if (wasHtml && element.innerHTML.includes(text)) {
                  element.innerHTML = element.innerHTML.replace(text, translatedText);
                } else {
                  element.textContent = translatedText;
                }
              }
              
              return { success: true, text, translatedText, context };
            } catch (error) {
              console.warn('AI Vision translation failed:', text, context, error);
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

      // Show success only on manual trigger
      if (force) {
        showTranslationStatus("Done", "success");
      }

    } catch (error) {
      console.error('Translation error:', error);
      showTranslationStatus("Failed", "error");
    } finally {
      setIsTranslating(false);
      setTranslationProgress(0);
      translationInProgress.current = false;
      // Auto-hide status after 2 seconds
      setTimeout(() => setTranslationStatus(null), 2000);
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


      {/* Compact Translation Status - Much Smaller & Comfortable */}
      {translationStatus && (
        <div className="fixed top-16 right-4 z-50 max-w-xs">
          <div className={`
            px-3 py-2 rounded-md backdrop-blur-sm shadow-md border text-xs transition-all duration-300 transform
            ${translationStatus.type === 'success' ? 'bg-green-500/80 border-green-400/50 text-white' : ''}
            ${translationStatus.type === 'error' ? 'bg-red-500/80 border-red-400/50 text-white' : ''}
            ${translationStatus.type === 'warning' ? 'bg-yellow-500/80 border-yellow-400/50 text-white' : ''}
            ${translationStatus.type === 'info' ? 'bg-blue-500/80 border-blue-400/50 text-white' : ''}
            ${translationStatus.type === 'loading' ? 'bg-primary/80 border-primary/50 text-primary-foreground' : ''}
            animate-slide-in-right
          `}>
            <div className="flex items-center gap-1.5">
              {translationStatus.type === 'loading' && (
                <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full"></div>
              )}
              {translationStatus.type === 'success' && <span className="text-xs">✓</span>}
              {translationStatus.type === 'error' && <span className="text-xs">✗</span>}
              {translationStatus.type === 'warning' && <span className="text-xs">⚠</span>}
              {translationStatus.type === 'info' && <span className="text-xs">i</span>}
              <span className="font-medium leading-tight">{translationStatus.message}</span>
            </div>
            {isTranslating && translationProgress > 0 && (
              <div className="mt-1">
                <div className="h-0.5 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-200"
                    style={{ width: `${translationProgress}%` }}
                  />
                </div>
                <div className="text-[10px] mt-0.5 opacity-90">{Math.round(translationProgress)}%</div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {children}
    </>
  );
};