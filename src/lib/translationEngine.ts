import { apiClient } from '@/lib/apiClient';

export type Language = 'en' | 'hy' | 'ru';

interface TranslationCache {
  [key: string]: {
    [targetLang: string]: string;
  };
}

interface TranslatableElement {
  element: Element;
  originalText: string;
  cacheKey: string;
  context?: string;
}

class TranslationEngine {
  private cache: TranslationCache = {};
  private isTranslating = false;
  private currentLanguage: Language = 'en';
  private observer: MutationObserver | null = null;
  private debounceTimer: number | null = null;
  private originalContent = new Map<Element, string>();

  constructor() {
    this.loadCache();
    this.setupMutationObserver();
  }

  private loadCache() {
    try {
      const savedCache = localStorage.getItem('i18nCache');
      if (savedCache) {
        this.cache = JSON.parse(savedCache);
        console.log('💾 Loaded translation cache');
      }
    } catch (error) {
      console.error('Failed to load translation cache:', error);
    }
  }

  private saveCache() {
    try {
      localStorage.setItem('i18nCache', JSON.stringify(this.cache));
    } catch (error) {
      console.error('Failed to save translation cache:', error);
    }
  }

  private setupMutationObserver() {
    this.observer = new MutationObserver(() => {
      if (this.currentLanguage !== 'en' && !this.isTranslating) {
        this.debouncedRetranslate();
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  private debouncedRetranslate() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = window.setTimeout(() => {
      console.log('🔄 Dynamic content detected, re-translating…');
      this.translateAll(this.currentLanguage);
    }, 150);
  }

  private collectTranslatableElements(): TranslatableElement[] {
    const elements: TranslatableElement[] = [];
    const seenTexts = new Set<string>();

    // Create a tree walker to find all text nodes
    const walker = document.createTreeWalker(
      document.body,
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

          // Skip hidden elements
          const style = window.getComputedStyle(parent);
          if (style.display === 'none' || style.visibility === 'hidden') {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip elements marked as non-translatable
          if (parent.hasAttribute('data-no-translate') || parent.closest('[data-no-translate]')) {
            return NodeFilter.FILTER_REJECT;
          }

          const text = node.textContent?.trim();
          if (!text || text.length < 2) {
            return NodeFilter.FILTER_REJECT;
          }

          // Skip pure numbers, URLs, emails, etc.
          if (/^[\d\s\.,\-\+\(\)\[\]]+$/.test(text) || 
              /^https?:\/\//.test(text) || 
              /^[^\s]+@[^\s]+\.[^\s]+$/.test(text)) {
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
      
      if (text && parent && !seenTexts.has(text)) {
        seenTexts.add(text);
        
        // Store original content
        if (!this.originalContent.has(parent)) {
          this.originalContent.set(parent, parent.innerHTML);
        }

        const context = this.analyzeContext(parent);
        elements.push({
          element: parent,
          originalText: text,
          cacheKey: `${text}_${context}`,
          context
        });
      }
    }

    return elements;
  }

  private analyzeContext(element: Element): string {
    const contexts = [];
    
    // Analyze tag name
    const tagName = element.tagName.toLowerCase();
    const semanticTags: Record<string, string> = {
      'h1': 'main heading',
      'h2': 'section heading',
      'h3': 'subsection heading',
      'button': 'button',
      'a': 'link',
      'nav': 'navigation',
      'header': 'header',
      'footer': 'footer',
      'p': 'paragraph',
      'span': 'text',
      'div': 'content'
    };

    if (semanticTags[tagName]) {
      contexts.push(semanticTags[tagName]);
    }

    // Analyze class names
    const className = element.className || '';
    if (className.includes('nav')) contexts.push('navigation');
    if (className.includes('button') || className.includes('btn')) contexts.push('button');
    if (className.includes('title') || className.includes('heading')) contexts.push('title');
    if (className.includes('hero')) contexts.push('hero');
    if (className.includes('card')) contexts.push('card');
    if (className.includes('price')) contexts.push('pricing');

    return contexts.join(', ') || 'general';
  }

  async translateAll(targetLang: Language) {
    if (this.isTranslating) {
      console.log('⚠️ Translation already in progress');
      return;
    }

    if (targetLang === 'en') {
      this.restoreOriginalContent();
      return;
    }

    this.isTranslating = true;
    this.currentLanguage = targetLang;

    try {
      const elements = this.collectTranslatableElements();
      console.log(`📊 Found ${elements.length} translatable elements`);

      if (elements.length === 0) {
        return;
      }

      // Check cache first
      const uncachedElements = elements.filter(({ cacheKey }) => 
        !this.cache[cacheKey]?.[targetLang]
      );

      if (uncachedElements.length > 0) {
        console.log(`🔄 Translating ${uncachedElements.length} new texts`);
        await this.translateBatch(uncachedElements, targetLang);
      }

      // Apply all translations
      this.applyTranslations(elements, targetLang);

    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      this.isTranslating = false;
    }
  }

  private async translateBatch(elements: TranslatableElement[], targetLang: Language) {
    const batchSize = 10;
    const texts = elements.map(el => el.originalText);
    const context = elements.map(el => el.context).join(', ');

    // Process in batches to avoid rate limits
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchElements = elements.slice(i, i + batchSize);
      
      try {
        console.log(`📦 Translating batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`);
        
        const result = await apiClient.invoke('batch-translate', {
          body: {
            texts: batch,
            targetLang,
            context
          }
        });

        if (result.error) {
          throw new Error(result.error);
        }

        // Update cache
        Object.entries(result.data.translations).forEach(([original, translated]) => {
          const element = batchElements.find(el => el.originalText === original);
          if (element) {
            if (!this.cache[element.cacheKey]) {
              this.cache[element.cacheKey] = {};
            }
            this.cache[element.cacheKey][targetLang] = translated as string;
            console.log(`✅ Updated: '${original}' → '${translated}'`);
          }
        });

        this.saveCache();

        // Rate limiting delay
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 1300));
        }

      } catch (error) {
        console.error(`❌ Batch translation failed:`, error);
        // Continue with next batch
      }
    }
  }

  private applyTranslations(elements: TranslatableElement[], targetLang: Language) {
    elements.forEach(({ element, originalText, cacheKey }) => {
      const translation = this.cache[cacheKey]?.[targetLang];
      if (translation && translation !== originalText) {
        // Replace text while preserving HTML structure
        const currentHTML = element.innerHTML;
        if (currentHTML.includes(originalText)) {
          element.innerHTML = currentHTML.replace(originalText, translation);
        } else if (element.textContent === originalText) {
          element.textContent = translation;
        }
      }
    });
  }

  private restoreOriginalContent() {
    this.originalContent.forEach((originalHTML, element) => {
      if (element && element.innerHTML !== originalHTML) {
        element.innerHTML = originalHTML;
      }
    });
    this.currentLanguage = 'en';
  }

  // Hook into language change
  onLanguageChange(newLanguage: Language) {
    console.log(`🌐 Language changed to: ${newLanguage}`);
    this.translateAll(newLanguage);
  }

  // Hook into route change
  onRouteChange(newPath: string) {
    console.log(`🌐 Route changed → ${newPath}`);
    if (this.currentLanguage !== 'en') {
      // Small delay to let new content load
      setTimeout(() => {
        this.translateAll(this.currentLanguage);
      }, 100);
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}

// Create singleton instance
export const translationEngine = new TranslationEngine();