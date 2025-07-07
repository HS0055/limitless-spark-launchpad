import { useCallback, useRef, useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { supabase } from '@/integrations/supabase/client';

interface ContentFingerprint {
  hash: string;
  context: string;
  frequency: number;
  lastUsed: number;
}

interface TranslationBudget {
  maxBatchSize: number;
  maxConcurrentRequests: number;
  timeoutMs: number;
  maxRetries: number;
}

interface SeamlessTranslationHook {
  translatePage: (targetLanguage: string) => Promise<void>;
  isTranslating: boolean;
  progress: number;
  error: string | null;
}

const TRANSLATION_BUDGET: TranslationBudget = {
  maxBatchSize: 50,
  maxConcurrentRequests: 3,
  timeoutMs: 5000,
  maxRetries: 2
};

export const useSeamlessTranslation = (): SeamlessTranslationHook => {
  const { translate } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const translationCache = useRef<Map<string, string>>(new Map());
  const fingerprintCache = useRef<Map<string, ContentFingerprint>>(new Map());
  const preRenderContainer = useRef<HTMLDivElement | null>(null);
  const activeRequests = useRef<Set<Promise<any>>>(new Set());

  // Initialize pre-render container
  useEffect(() => {
    if (!preRenderContainer.current) {
      const container = document.createElement('div');
      container.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        visibility: hidden;
        pointer-events: none;
        z-index: -1000;
      `;
      container.setAttribute('aria-hidden', 'true');
      document.body.appendChild(container);
      preRenderContainer.current = container;
    }

    return () => {
      if (preRenderContainer.current?.parentNode) {
        preRenderContainer.current.parentNode.removeChild(preRenderContainer.current);
      }
    };
  }, []);

  // Generate content fingerprint
  const generateFingerprint = useCallback((text: string, context: string): string => {
    // Use a simple hash instead of btoa to handle Unicode characters
    const input = text + context;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36).substring(0, 16);
  }, []);

  // Extract all translatable content
  const extractTranslatableContent = useCallback(() => {
    const contentMap = new Map<string, { element: Element; originalText: string; context: string }>();
    
    // More comprehensive text content extraction
    const textNodes = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const text = node.textContent?.trim() || '';
          if (text.length < 1) return NodeFilter.FILTER_REJECT;
          
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          // Skip script, style, code elements and hidden elements
          const tagName = parent.tagName.toLowerCase();
          if (['script', 'style', 'code', 'pre', 'noscript'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Skip if parent has data-no-translate
          if (parent.hasAttribute('data-no-translate') || parent.closest('[data-no-translate]')) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Only skip very specific patterns (not general text)
          if (/^[\s\-_•]+$|^[{}[\]()]+$|^[&<>]+$/.test(text)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = textNodes.nextNode()) {
      const element = node.parentElement!;
      const text = node.textContent!.trim();
      
      // Skip empty or whitespace-only text
      if (!text || text.length === 0) continue;
      
      const context = `${element.tagName.toLowerCase()}-${element.className || 'text'}`;
      const fingerprint = generateFingerprint(text, context);
      
      contentMap.set(fingerprint, { element, originalText: text, context });
    }

    // Attributes (alt, title, placeholder, aria-label)
    const attributeSelectors = [
      '[alt]', '[title]', '[placeholder]', 
      '[aria-label]', '[aria-description]'
    ];

    attributeSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        ['alt', 'title', 'placeholder', 'aria-label', 'aria-description'].forEach(attr => {
          const value = element.getAttribute(attr);
          if (value && value.trim().length > 2) {
            const context = `${element.tagName.toLowerCase()}-${attr}`;
            const fingerprint = generateFingerprint(value, context);
            contentMap.set(fingerprint, { element, originalText: value, context });
          }
        });
      });
    });

    return contentMap;
  }, [generateFingerprint]);

  // Pre-render translations in hidden container
  const preRenderTranslations = useCallback((
    contentMap: Map<string, { element: Element; originalText: string; context: string }>,
    translations: Map<string, string>
  ) => {
    if (!preRenderContainer.current) return;

    const fragment = document.createDocumentFragment();
    
    contentMap.forEach(({ element, originalText }, fingerprint) => {
      const translatedText = translations.get(fingerprint);
      if (!translatedText) return;

      // Clone element and apply translation
      const clonedElement = element.cloneNode(true) as Element;
      
      // Update text content or attributes
      if (element.hasAttribute('alt')) {
        clonedElement.setAttribute('alt', translatedText);
      } else if (element.hasAttribute('title')) {
        clonedElement.setAttribute('title', translatedText);
      } else if (element.hasAttribute('placeholder')) {
        clonedElement.setAttribute('placeholder', translatedText);
      } else if (element.hasAttribute('aria-label')) {
        clonedElement.setAttribute('aria-label', translatedText);
      } else {
        clonedElement.textContent = translatedText;
      }
      
      fragment.appendChild(clonedElement);
    });

    preRenderContainer.current.appendChild(fragment);
  }, []);

  // Apply translations atomically
  const applyTranslationsAtomically = useCallback((
    contentMap: Map<string, { element: Element; originalText: string; context: string }>,
    translations: Map<string, string>
  ) => {
    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      const updates: (() => void)[] = [];

      contentMap.forEach(({ element, originalText, context }, fingerprint) => {
        const translatedText = translations.get(fingerprint);
        if (!translatedText) return;

        // Prepare update function
        if (context.includes('-alt')) {
          updates.push(() => element.setAttribute('alt', translatedText));
        } else if (context.includes('-title')) {
          updates.push(() => element.setAttribute('title', translatedText));
        } else if (context.includes('-placeholder')) {
          updates.push(() => element.setAttribute('placeholder', translatedText));
        } else if (context.includes('-aria-label')) {
          updates.push(() => element.setAttribute('aria-label', translatedText));
        } else {
          updates.push(() => {
            if (element.firstChild?.nodeType === Node.TEXT_NODE) {
              element.firstChild.textContent = translatedText;
            }
          });
        }
      });

      // Apply all updates in a single batch
      updates.forEach(update => update());
      
      // Add subtle fade-in effect
      document.body.style.transition = 'opacity 0.15s ease-in-out';
      document.body.style.opacity = '0.98';
      
      setTimeout(() => {
        document.body.style.opacity = '1';
        setTimeout(() => {
          document.body.style.transition = '';
        }, 150);
      }, 10);
    });
  }, []);

  // Batch translate with queue management
  const batchTranslate = useCallback(async (
    texts: string[],
    targetLanguage: string
  ): Promise<Map<string, string>> => {
    const results = new Map<string, string>();
    const batches: string[][] = [];
    
    // Split into batches
    for (let i = 0; i < texts.length; i += TRANSLATION_BUDGET.maxBatchSize) {
      batches.push(texts.slice(i, i + TRANSLATION_BUDGET.maxBatchSize));
    }

    // Process batches with concurrency control
    const processBatch = async (batch: string[], batchIndex: number) => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-web-content', {
          body: {
            content: batch.join('\n---SEPARATOR---\n'),
            type: 'translation',
            targetLanguage,
            tone: 'professional'
          }
        });

        if (error) throw error;

        // Parse batch results
        const translatedBatch = data.content.split('\n---SEPARATOR---\n');
        batch.forEach((original, index) => {
          if (translatedBatch[index]) {
            results.set(original, translatedBatch[index].trim());
            translationCache.current.set(`${original}-${targetLanguage}`, translatedBatch[index].trim());
          }
        });

        setProgress((batchIndex + 1) / batches.length * 100);
      } catch (error) {
        console.error(`Batch ${batchIndex} failed:`, error);
      }
    };

    // Execute batches with concurrency limit
    const promises: Promise<void>[] = [];
    for (let i = 0; i < batches.length; i += TRANSLATION_BUDGET.maxConcurrentRequests) {
      const concurrentBatches = batches.slice(i, i + TRANSLATION_BUDGET.maxConcurrentRequests);
      const batchPromises = concurrentBatches.map((batch, localIndex) => 
        processBatch(batch, i + localIndex)
      );
      promises.push(...batchPromises);
      
      // Wait for current batch to complete before starting next
      if (i + TRANSLATION_BUDGET.maxConcurrentRequests < batches.length) {
        await Promise.allSettled(batchPromises);
      }
    }

    await Promise.allSettled(promises);
    return results;
  }, []);

  // Main translation function
  const translatePage = useCallback(async (targetLanguage: string) => {
    if (isTranslating) return;
    
    setIsTranslating(true);
    setProgress(0);
    setError(null);

    try {
      // Extract content
      const contentMap = extractTranslatableContent();
      
      if (contentMap.size === 0) {
        setProgress(100);
        return;
      }

      // Check cache first
      const cachedTranslations = new Map<string, string>();
      const textsToTranslate: string[] = [];

      contentMap.forEach(({ originalText }, fingerprint) => {
        const cacheKey = `${originalText}-${targetLanguage}`;
        const cached = translationCache.current.get(cacheKey);
        
        if (cached) {
          cachedTranslations.set(fingerprint, cached);
        } else {
          textsToTranslate.push(originalText);
        }
      });

      // Apply cached translations immediately
      if (cachedTranslations.size > 0) {
        applyTranslationsAtomically(contentMap, cachedTranslations);
      }

      // Translate remaining texts
      if (textsToTranslate.length > 0) {
        const newTranslations = await batchTranslate(textsToTranslate, targetLanguage);
        
        // Map back to fingerprints
        const fingerprintTranslations = new Map<string, string>();
        contentMap.forEach(({ originalText }, fingerprint) => {
          const translation = newTranslations.get(originalText);
          if (translation) {
            fingerprintTranslations.set(fingerprint, translation);
          }
        });

        // Pre-render and apply
        preRenderTranslations(contentMap, fingerprintTranslations);
        applyTranslationsAtomically(contentMap, fingerprintTranslations);
      }

      setProgress(100);
    } catch (err) {
      console.error('Translation failed:', err);
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  }, [isTranslating, extractTranslatableContent, batchTranslate, preRenderTranslations, applyTranslationsAtomically]);

  return {
    translatePage,
    isTranslating,
    progress,
    error
  };
};