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
      const { data, error } = await supabase.functions.invoke('intelligent-translate', {
        body: {
          content: text,
          sourceLang: 'en',
          targetLang: targetLang,
          translationType: 'standard',
          context: 'Website auto-translation'
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

  const translatePage = async (targetLang: string) => {
    if (!autoTranslateEnabled) return;
    
    if (targetLang === 'en') {
      restoreOriginalContent();
      return;
    }

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

      if (uncachedTexts.length > 0) {
        // Show cost estimate
        toast({
          title: "Translation Starting",
          description: `Translating ${uncachedTexts.length} new texts (${textElements.length - uncachedTexts.length} from cache)`,
        });
      }

      // Translate texts in batches to avoid overloading
      const batchSize = 3; // Reduced batch size to save costs
      
      for (let i = 0; i < textElements.length; i += batchSize) {
        const batch = textElements.slice(i, i + batchSize);
        
        // Process batch in parallel
        await Promise.all(
          batch.map(async ({ element, text }) => {
            const translatedText = await translateText(text, targetLang);
            if (element && element.textContent === text) {
              element.textContent = translatedText;
            }
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
    }
  };

  useEffect(() => {
    // Don't translate on initial load
    if (previousLanguage.current === language) {
      previousLanguage.current = language;
      return;
    }

    // Add a small delay to ensure page content is loaded
    const timer = setTimeout(() => {
      translatePage(language);
      previousLanguage.current = language;
    }, 1000);

    return () => clearTimeout(timer);
  }, [language]);

  const enableAutoTranslate = () => {
    setAutoTranslateEnabled(true);
    localStorage.setItem('auto-translate-enabled', 'true');
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
              <p>Auto-translation uses OpenAI API which costs money:</p>
              <ul className="space-y-1 ml-4">
                <li>• ~$0.002 per page translation</li>
                <li>• Cached translations are free</li>
                <li>• You can disable anytime</li>
              </ul>
              <p className="text-xs bg-muted p-2 rounded">
                💡 Tip: Translations are cached locally to reduce costs
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={enableAutoTranslate} className="flex-1">
                Enable Auto-Translation
              </Button>
              <Button onClick={dismissWarning} variant="outline">
                Skip
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-translate status */}
      {autoTranslateEnabled && language !== 'en' && (
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
                localStorage.setItem('auto-translate-enabled', 'false');
              }}
            >
              ×
            </Button>
          </div>
        </div>
      )}
      
      {children}
    </>
  );
};