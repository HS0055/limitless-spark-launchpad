import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { TranslationQueue } from './TranslationQueue';
import { cacheManager } from '@/lib/cacheManager';

interface Props {
  children: React.ReactNode;
}

export const AutoTranslateProvider = ({ children }: Props) => {
  const { language } = useLanguage();
  const location = useLocation();
  const observerRef = useRef<MutationObserver | null>(null);
  const queueRef = useRef<TranslationQueue>(new TranslationQueue());
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const previousLanguage = useRef<Language>('en');

  // Analyze element context for better translation accuracy
  const analyzeContext = useCallback((element: Element): string => {
    const contexts = [];
    const tagName = element.tagName.toLowerCase();
    const className = element.className || '';
    
    // Semantic HTML context
    const semanticTags: Record<string, string> = {
      'h1': 'primary heading', 'h2': 'section heading', 'h3': 'subsection heading',
      'p': 'paragraph', 'button': 'button', 'a': 'link', 'nav': 'navigation',
      'span': 'inline text', 'div': 'content block'
    };
    
    if (semanticTags[tagName]) contexts.push(semanticTags[tagName]);
    
    // UI component context
    if (className.includes('nav')) contexts.push('navigation');
    if (className.includes('button') || className.includes('btn')) contexts.push('button');
    if (className.includes('title') || className.includes('heading')) contexts.push('title');
    if (className.includes('hero')) contexts.push('hero section');
    if (className.includes('footer')) contexts.push('footer');
    
    return contexts.join(', ') || 'general content';
  }, []);

  // Find all translatable elements
  const getTranslatableElements = useCallback((): Element[] => {
    const elements = document.querySelectorAll('[data-i18n], h1, h2, h3, p, button, a, span');
    return Array.from(elements).filter(el => {
      const text = el.textContent?.trim();
      return text && 
             text.length > 1 && 
             !el.hasAttribute('data-translated') &&
             !el.closest('[data-no-translate]') &&
             !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName);
    });
  }, []);

  // Translate all elements
  const translateAll = useCallback(async () => {
    if (language === 'en') return;

    const elements = getTranslatableElements();
    console.log(`📊 Found ${elements.length} translatable elements`);
    
    if (elements.length === 0) return;

    const translationPromises = elements.map(async (element) => {
      const text = element.textContent?.trim();
      if (!text) return;

      const context = analyzeContext(element);
      
      try {
        const translatedText = await queueRef.current.add({
          element,
          text,
          context,
          resolve: () => {},
          reject: () => {}
        });
        
        element.textContent = translatedText;
        element.setAttribute('data-translated', language);
        console.log(`✅ Updated: '${text.substring(0, 30)}...' → '${translatedText.substring(0, 30)}...'`);
        
      } catch (error) {
        console.error(`❌ Translation failed for: "${text.substring(0, 30)}..."`, error);
      }
    });

    await Promise.allSettled(translationPromises);
  }, [language, getTranslatableElements, analyzeContext]);

  // Handle route changes
  useEffect(() => {
    console.log(`🌐 Route changed → ${location.pathname}`);
    cacheManager.trackPageView(location.pathname);
    
    if (language !== 'en') {
      // Clear previous translations when route changes
      document.querySelectorAll('[data-translated]').forEach(el => {
        el.removeAttribute('data-translated');
      });
      
      // Debounce translation to avoid excessive calls
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(translateAll, 300);
    }
  }, [location.pathname, translateAll, language]);

  // Handle language changes
  useEffect(() => {
    if (language !== previousLanguage.current) {
      console.log(`🔄 Language changed from ${previousLanguage.current} to ${language}`);
      
      if (language === 'en') {
        // Clear translations when switching back to English
        document.querySelectorAll('[data-translated]').forEach(el => {
          el.removeAttribute('data-translated');
        });
        queueRef.current.clear();
      } else {
        translateAll();
      }
      
      previousLanguage.current = language;
    }
  }, [language, translateAll]);

  // Setup MutationObserver for dynamic content
  useEffect(() => {
    if (language === 'en') return;

    const debouncedTranslate = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        console.log('🔄 Dynamic content detected, re-translating…');
        translateAll();
      }, 150); // 150ms debounce as requested
    };

    observerRef.current = new MutationObserver((mutations) => {
      let hasNewContent = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.textContent?.trim() && !element.hasAttribute('data-translated')) {
                hasNewContent = true;
              }
            }
          });
        }
      });
      
      if (hasNewContent) {
        debouncedTranslate();
      }
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [language, translateAll]);

  // Initial translation on mount
  useEffect(() => {
    if (language !== 'en') {
      translateAll();
    }
  }, []); // Run once on mount

  return <>{children}</>;
};