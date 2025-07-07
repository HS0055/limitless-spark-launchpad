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
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(false);
  const [showCostWarning, setShowCostWarning] = useState(false); // Disabled by default
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [translationMode, setTranslationMode] = useState<'auto' | 'manual'>('manual');
  const [translatedLanguages, setTranslatedLanguages] = useState<Set<string>>(new Set());
  const translationCache = useRef<TranslationCache>({});
  const originalContent = useRef<Map<Element, string>>(new Map());
  const previousLanguage = useRef<string>('en');

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
    if (!autoTranslateEnabled && !force) return;
    
    if (targetLang === 'en') {
      restoreOriginalContent();
      return;
    }

    // Check if page was already translated for this session
    const sessionKey = `translated-${targetLang}-${window.location.pathname}`;
    const alreadyTranslated = sessionStorage.getItem(sessionKey);
    
    if (alreadyTranslated && !force) {
      // Show subtle notification instead of intrusive popup
      showTranslationStatus("Page already translated", "info");
      return;
    }

    setIsTranslating(true);
    setTranslationProgress(0);
    showTranslationStatus("Analyzing page content...", "loading");

    try {
      // Extract all text content from the page with improved detection
      const textElements = extractTextContent(document.body);
      
      if (textElements.length === 0) {
        showTranslationStatus("No translatable content found", "warning");
        return;
      }

      // Smart caching - prioritize frequently used phrases
      const uncachedTexts = textElements.filter(({ text }) => {
        const cacheKey = text.toLowerCase();
        return !translationCache.current[cacheKey]?.[targetLang];
      });

      showTranslationStatus(`Translating ${textElements.length} elements...`, "loading");

      // Optimized batch processing with adaptive sizing
      const batchSize = uncachedTexts.length > 50 ? 3 : 5; // Smaller batches for large pages
      let completed = 0;
      
      // Process in smart batches - group similar content together
      for (let i = 0; i < textElements.length; i += batchSize) {
        const batch = textElements.slice(i, i + batchSize);
        
        // Process batch with improved error handling and retry logic
        const results = await Promise.allSettled(
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
        
        // Update status with progress
        showTranslationStatus(`Translated ${completed}/${textElements.length} elements`, "loading");
        
        // Small delay to prevent API rate limiting
        if (i + batchSize < textElements.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Mark page as translated for this session
      sessionStorage.setItem(sessionKey, 'true');

      // Enhanced completion notification
      const successCount = textElements.length - uncachedTexts.length;
      showTranslationStatus(
        `Translation complete! ${uncachedTexts.length} new, ${successCount} from cache`, 
        "success"
      );

    } catch (error) {
      console.error('Translation error:', error);
      showTranslationStatus("Translation failed. Please try again.", "error");
    } finally {
      setIsTranslating(false);
      setTranslationProgress(0);
      // Hide status after delay
      setTimeout(() => setTranslationStatus(null), 3000);
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
    // Only auto-translate if enabled and mode is auto
    if (!autoTranslateEnabled || translationMode !== 'auto') {
      previousLanguage.current = language;
      return;
    }

    // Don't translate on initial load
    if (previousLanguage.current === language) {
      previousLanguage.current = language;
      return;
    }

    // Reduced delay for faster response
    const timer = setTimeout(() => {
      translatePage(language);
      previousLanguage.current = language;
    }, 300);

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
              disabled={isTranslating}
              size="sm"
              className="w-12 h-12 p-0 rounded-full bg-gradient-to-br from-primary to-primary-foreground backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-110"
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

      {/* Auto-translate status */}
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
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Enhanced Translation Status - Non-intrusive */}
      {translationStatus && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className={`
            px-4 py-3 rounded-lg backdrop-blur-md shadow-xl border transition-all duration-500 transform
            ${translationStatus.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' : ''}
            ${translationStatus.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' : ''}
            ${translationStatus.type === 'warning' ? 'bg-yellow-500/90 border-yellow-400 text-white' : ''}
            ${translationStatus.type === 'info' ? 'bg-blue-500/90 border-blue-400 text-white' : ''}
            ${translationStatus.type === 'loading' ? 'bg-primary/90 border-primary text-primary-foreground' : ''}
            animate-slide-in-right
          `}>
            <div className="flex items-center gap-2">
              {translationStatus.type === 'loading' && (
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
              )}
              {translationStatus.type === 'success' && <span className="text-lg">✅</span>}
              {translationStatus.type === 'error' && <span className="text-lg">❌</span>}
              {translationStatus.type === 'warning' && <span className="text-lg">⚠️</span>}
              {translationStatus.type === 'info' && <span className="text-lg">ℹ️</span>}
              <span className="text-sm font-medium">{translationStatus.message}</span>
            </div>
            {isTranslating && (
              <div className="mt-2">
                <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-300"
                    style={{ width: `${translationProgress}%` }}
                  />
                </div>
                <div className="text-xs mt-1 opacity-90">{Math.round(translationProgress)}% complete</div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {children}
    </>
  );
};