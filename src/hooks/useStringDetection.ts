import { useEffect, useState, useCallback } from 'react';

interface StringDetectionConfig {
  enabled: boolean;
  scanInterval: number;
  exclusions: string[];
  includeAttributes: boolean;
  detectRuntimeStrings: boolean;
}

interface DetectedString {
  text: string;
  element: HTMLElement;
  attribute?: string;
  context: string;
  xpath: string;
  namespace?: string;
}

export const useStringDetection = (config: StringDetectionConfig) => {
  const [detectedStrings, setDetectedStrings] = useState<DetectedString[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const getXPath = useCallback((element: HTMLElement): string => {
    if (element.id) return `//*[@id="${element.id}"]`;
    
    const parts: string[] = [];
    let current: HTMLElement | null = element;
    
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let index = 0;
      let hasFollowingSiblings = false;
      
      if (current.previousSibling) {
        index = Array.from(current.parentNode?.children || [])
          .filter(el => el.tagName === current?.tagName)
          .indexOf(current as Element) + 1;
        hasFollowingSiblings = index > 1;
      }
      
      const tagName = current.tagName.toLowerCase();
      const part = hasFollowingSiblings ? `${tagName}[${index}]` : tagName;
      parts.unshift(part);
      
      current = current.parentElement;
    }
    
    return '/' + parts.join('/');
  }, []);

  const isStringTranslatable = useCallback((text: string, element: HTMLElement): boolean => {
    // Skip if text is too short
    if (text.trim().length < 3) return false;
    
    // Skip if text contains only numbers, symbols, or URLs
    if (/^[\d\s\-.,!@#$%^&*()_+=\[\]{}|;:'"<>?/~`]+$/.test(text)) return false;
    if (/^https?:\/\//.test(text)) return false;
    if (/^[A-Z_][A-Z0-9_]*$/.test(text)) return false; // Skip constants
    
    // Skip excluded elements
    const tagName = element.tagName.toLowerCase();
    if (['script', 'style', 'noscript', 'meta', 'title'].includes(tagName)) return false;
    
    // Skip if parent has translation exclusion class
    if (element.closest('.no-translate, [data-no-translate]')) return false;
    
    // Skip if already has translation marker
    if (element.hasAttribute('data-i18n') || element.hasAttribute('data-translated')) return false;
    
    return true;
  }, []);

  const scanDOM = useCallback(async () => {
    if (!config.enabled || isScanning) return;
    
    setIsScanning(true);
    const detected: DetectedString[] = [];
    
    try {
      // Scan text nodes
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const element = node.parentElement;
            if (!element) return NodeFilter.FILTER_REJECT;
            
            const text = node.textContent?.trim() || '';
            return isStringTranslatable(text, element) 
              ? NodeFilter.FILTER_ACCEPT 
              : NodeFilter.FILTER_REJECT;
          }
        }
      );

      let node;
      while (node = walker.nextNode()) {
        const element = node.parentElement!;
        const text = node.textContent?.trim() || '';
        
        if (text && isStringTranslatable(text, element)) {
          // Determine namespace from element context
          let namespace = 'common';
          if (element.closest('nav, [role="navigation"]')) namespace = 'nav';
          else if (element.closest('header, .hero')) namespace = 'hero';
          else if (element.closest('footer')) namespace = 'footer';
          else if (element.closest('.features')) namespace = 'features';
          else if (element.closest('.pricing')) namespace = 'pricing';
          
          detected.push({
            text,
            element,
            context: element.tagName.toLowerCase(),
            xpath: getXPath(element),
            namespace
          });
        }
      }

      // Scan attributes if enabled
      if (config.includeAttributes) {
        const attributesToScan = ['title', 'alt', 'placeholder', 'aria-label', 'data-tooltip'];
        const elementsWithAttributes = document.querySelectorAll(
          attributesToScan.map(attr => `[${attr}]`).join(', ')
        );

        elementsWithAttributes.forEach(element => {
          attributesToScan.forEach(attr => {
            const value = element.getAttribute(attr);
            if (value && isStringTranslatable(value, element as HTMLElement)) {
              detected.push({
                text: value,
                element: element as HTMLElement,
                attribute: attr,
                context: `${element.tagName.toLowerCase()}[${attr}]`,
                xpath: getXPath(element as HTMLElement),
                namespace: 'common'
              });
            }
          });
        });
      }

      setDetectedStrings(detected);
      
      // Queue detected strings for translation
      if (detected.length > 0) {
        await queueDetectedStrings(detected);
      }
      
    } catch (error) {
      console.error('String detection error:', error);
    } finally {
      setIsScanning(false);
    }
  }, [config, isScanning, isStringTranslatable, getXPath]);

  const queueDetectedStrings = async (strings: DetectedString[]) => {
    try {
      // Get current language from localStorage or URL
      const currentLang = localStorage.getItem('preferred-language') || 'en';
      if (currentLang === 'en') return; // Skip for English
      
      // Batch queue strings for translation
      const uniqueStrings = strings.reduce((acc, item) => {
        if (!acc.some(existing => existing.text === item.text)) {
          acc.push(item);
        }
        return acc;
      }, [] as DetectedString[]);

      await fetch('https://mbwieeegglyprxoncckdj.supabase.co/functions/v1/batch-translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id2llZWdnbHlwcnhvbmNja2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NzE3MzQsImV4cCI6MjA2NzM0NzczNH0.mSp5jZo9OgsP7xRYueRqUH9GyXiqoERbnoR2JHWnjPk'
        },
        body: JSON.stringify({
          strings: uniqueStrings.map(s => ({
            text: s.text,
            context: s.context,
            namespace: s.namespace,
            page_path: window.location.pathname
          })),
          target_language: currentLang
        })
      });

    } catch (error) {
      // Silent fail - don't crash the app for translation queueing issues
      console.debug('Failed to queue detected strings:', error);
    }
  };

  // Auto-scan on interval
  useEffect(() => {
    if (!config.enabled) return;

    const interval = setInterval(scanDOM, config.scanInterval);
    
    // Initial scan
    scanDOM();
    
    // Scan on DOM changes
    const observer = new MutationObserver((mutations) => {
      const hasTextChanges = mutations.some(mutation => 
        mutation.type === 'childList' || 
        (mutation.type === 'characterData' && mutation.target.textContent?.trim())
      );
      
      if (hasTextChanges) {
        setTimeout(scanDOM, 500); // Debounce
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, [config, scanDOM]);

  return {
    detectedStrings,
    isScanning,
    scanDOM,
    queueDetectedStrings
  };
};