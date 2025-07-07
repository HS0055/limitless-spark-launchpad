import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface TranslationCache {
  [key: string]: {
    [targetLang: string]: string;
  };
}

export const AutoTranslateProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
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

  // Load cache from localStorage
  useEffect(() => {
    try {
      const savedCache = localStorage.getItem('translation-cache');
      if (savedCache) {
        translationCache.current = JSON.parse(savedCache);
      }
      
      const autoEnabled = localStorage.getItem('auto-translate-enabled') === 'true';
      setAutoTranslateEnabled(autoEnabled);
      
      const mode = localStorage.getItem('translation-mode') as 'auto' | 'manual' || 'manual';
      setTranslationMode(mode);
      
      const warningDismissed = localStorage.getItem('cost-warning-dismissed') === 'true';
      setShowCostWarning(!warningDismissed);
    } catch (error) {
      console.error('Error loading translation cache:', error);
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

  const extractTextContent = (element: Element): Array<{ element: Element; text: string }> => {
    const textElements: Array<{ element: Element; text: string }> = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          // Enhanced skip logic - more comprehensive
          const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'SVG', 'PATH', 'INPUT', 'BUTTON'];
          if (skipTags.includes(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Skip hidden elements
          const style = window.getComputedStyle(parent);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Skip elements with data-no-translate attribute
          if (parent.hasAttribute('data-no-translate') || parent.closest('[data-no-translate]')) {
            return NodeFilter.FILTER_REJECT;
          }
          
          const text = node.textContent?.trim();
          if (!text || text.length < 2) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Enhanced filtering - skip more technical content
          if (/^[\d\s\.,\-\+\(\)\[\]]+$/.test(text) || 
              /^https?:\/\//.test(text) || 
              /^[^\s]+@[^\s]+\.[^\s]+$/.test(text) ||
              /^[A-Z_]{2,}$/.test(text) ||
              /^[0-9]+(\.[0-9]+)*$/.test(text) ||
              /^[\{\}\[\]\(\)\<\>\/\\]+$/.test(text) ||
              text.startsWith('//') || text.startsWith('/*') ||
              /^[^a-zA-Z]+$/.test(text)) {
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
      if (text && text.length > 1 && parent) {
        // Group consecutive text nodes from the same parent
        const existingEntry = textElements.find(entry => entry.element === parent);
        if (existingEntry) {
          if (!existingEntry.text.includes(text)) {
            existingEntry.text += ' ' + text;
          }
        } else {
          textElements.push({ element: parent, text });
          // Store original content if not already stored
          if (!originalContent.current.has(parent)) {
            originalContent.current.set(parent, text);
          }
        }
      }
    }
    
    return textElements;
  };

  const translateText = async (text: string, targetLang: string): Promise<string> => {
    // Check cache first
    const cacheKey = text.toLowerCase();
    if (translationCache.current[cacheKey]?.[targetLang]) {
      return translationCache.current[cacheKey][targetLang];
    }

    try {
      // Use faster AI translate function with speed optimization
      const { data, error } = await supabase.functions.invoke('ai-translate', {
        body: {
          text: text,
          sourceLang: 'en',
          targetLang: targetLang
        }
      });

      if (error) throw error;

      const translatedText = data.translatedText;

      // Cache the translation
      if (!translationCache.current[cacheKey]) {
        translationCache.current[cacheKey] = {};
      }
      translationCache.current[cacheKey][targetLang] = translatedText;
      
      // Save to localStorage
      saveCache();

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
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

  const translatePage = async (targetLang: string, force = false) => {
    // Prevent multiple simultaneous translations
    if (translationInProgress.current && !force) {
      return;
    }

    if (!autoTranslateEnabled && !force) return;
    
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

      // Optimized batch processing with adaptive sizing
      const batchSize = uncachedTexts.length > 50 ? 2 : 3; // Smaller batches for reliability
      let completed = 0;
      
      // Process in smart batches
      for (let i = 0; i < textElements.length; i += batchSize) {
        const batch = textElements.slice(i, i + batchSize);
        
        // Process batch with improved error handling
        await Promise.allSettled(
          batch.map(async ({ element, text }) => {
            try {
              const translatedText = await translateText(text, targetLang);
              
              // Smart element update - preserve formatting
              if (element && element.textContent?.trim() === text.trim()) {
                const wasHtml = element.innerHTML !== element.textContent;
                if (wasHtml && element.innerHTML.includes(text)) {
                  element.innerHTML = element.innerHTML.replace(text, translatedText);
                } else {
                  element.textContent = translatedText;
                }
              }
              
              return { success: true, text, translatedText };
            } catch (error) {
              console.warn('Failed to translate text:', text, error);
              return { success: false, text, error };
            }
          })
        );

        completed += batch.length;
        const progress = (completed / textElements.length) * 100;
        setTranslationProgress(progress);
        
        // Small delay to prevent API rate limiting
        if (i + batchSize < textElements.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
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
    // Auto-translate when language changes (smart mode)
    if (!autoTranslateEnabled || translationMode !== 'auto') {
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
    }, 500); // Slightly longer delay for better UX

    return () => clearTimeout(timer);
  }, [language, autoTranslateEnabled, translationMode]);

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

      {/* Enhanced Translation Controls */}
      {(translationMode === 'manual' || !autoTranslateEnabled) && language !== 'en' && (
        <div className="fixed top-20 right-4 z-40">
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => translatePage(language, true)}
              disabled={isTranslating || translationInProgress.current}
              size="sm"
              className="w-12 h-12 p-0 rounded-full bg-gradient-to-br from-primary to-primary-foreground backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              title={`Translate to ${language === 'hy' ? 'Armenian' : language === 'ru' ? 'Russian' : language}`}
            >
              {isTranslating ? (
                <div className="animate-spin text-lg">🔄</div>
              ) : (
                <div className="text-lg">🌐</div>
              )}
            </Button>
            {/* Quick language preview */}
            <div className="text-xs text-center text-muted-foreground font-medium">
              {language.toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {/* Auto-translate status - Enhanced */}
      {autoTranslateEnabled && translationMode === 'auto' && (
        <div className="fixed top-20 right-4 z-40 bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Auto-translate: ON</span>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-4 w-4 p-0"
              onClick={() => {
                setAutoTranslateEnabled(false);
                setTranslationMode('manual');
                localStorage.setItem('auto-translate-enabled', 'false');
                localStorage.setItem('translation-mode', 'manual');
              }}
              title="Disable auto-translate"
            >
              ×
            </Button>
          </div>
          {hasTranslatedOnce && (
            <div className="text-[10px] text-muted-foreground mt-1">
              Page translated automatically
            </div>
          )}
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