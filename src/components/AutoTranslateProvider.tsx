import { useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TranslationCache {
  [key: string]: {
    [targetLang: string]: string;
  };
}

export const AutoTranslateProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const translationCache = useRef<TranslationCache>({});
  const originalContent = useRef<Map<Element, string>>(new Map());
  const previousLanguage = useRef<string>('en');

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

      // Show translating toast
      toast({
        title: "Translating Page",
        description: `Translating ${textElements.length} text elements...`,
      });

      // Translate texts in batches to avoid overloading
      const batchSize = 5;
      
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
        description: "Page content has been translated successfully",
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

  return <>{children}</>;
};