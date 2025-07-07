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
  const [showCostWarning, setShowCostWarning] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [translationMode, setTranslationMode] = useState<'auto' | 'manual'>('manual');
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
          
          // Skip script, style, and other non-visible elements
          const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE'];
          if (skipTags.includes(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Skip empty or whitespace-only text
          const text = node.textContent?.trim();
          if (!text || text.length < 3) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Skip numbers, URLs, emails, and technical content
          if (/^[\d\s\.,]+$/.test(text) || 
              /^https?:\/\//.test(text) || 
              /^[^\s]+@[^\s]+\.[^\s]+$/.test(text) ||
              /^[A-Z_]{2,}$/.test(text)) {
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
      if (text && text.length > 2 && parent) {
        textElements.push({ element: parent, text });
        // Store original content if not already stored
        if (!originalContent.current.has(parent)) {
          originalContent.current.set(parent, text);
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

    setIsTranslating(true);
    setTranslationProgress(0);

    try {
      // Extract all text content from the page
      const textElements = extractTextContent(document.body);
      
      if (textElements.length === 0) {
        return;
      }

      // Count how many texts need translation (not cached)
      const uncachedTexts = textElements.filter(({ text }) => {
        const cacheKey = text.toLowerCase();
        return !translationCache.current[cacheKey]?.[targetLang];
      });

      // Aggressive batch processing for speed
      const batchSize = 10; // Increased batch size
      let completed = 0;
      
      for (let i = 0; i < textElements.length; i += batchSize) {
        const batch = textElements.slice(i, i + batchSize);
        
        // Process entire batch in parallel for maximum speed
        await Promise.all(
          batch.map(async ({ element, text }) => {
            const translatedText = await translateText(text, targetLang);
            if (element && element.textContent === text) {
              element.textContent = translatedText;
            }
            completed++;
            setTranslationProgress((completed / textElements.length) * 100);
          })
        );
      }

      toast({
        title: "Translation Complete",
        description: `Translated ${uncachedTexts.length} new texts, used ${textElements.length - uncachedTexts.length} cached`,
      });

    } catch (error) {
      console.error('Auto-translation error:', error);
      toast({
        title: "Translation Failed",
        description: "Failed to translate page content",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
      setTranslationProgress(0);
    }
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

      {/* Translation Controls */}
      {(translationMode === 'manual' || !autoTranslateEnabled) && language !== 'en' && (
        <div className="fixed top-20 right-4 z-40 bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={() => translatePage(language, true)}
              disabled={isTranslating}
              className="h-8 px-3 text-xs"
            >
              {isTranslating ? '🔄' : '🌐'} Translate Page
            </Button>
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

      {/* Translation Progress */}
      {isTranslating && (
        <div className="fixed top-32 right-4 z-40 bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
          <div className="flex items-center gap-2 min-w-32">
            <div className="flex-1">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${translationProgress}%` }}
                />
              </div>
            </div>
            <span>{Math.round(translationProgress)}%</span>
          </div>
        </div>
      )}
      
      {children}
    </>
  );
};