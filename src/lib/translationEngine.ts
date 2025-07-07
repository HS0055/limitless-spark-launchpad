import { apiClient } from '@/lib/apiClient';

export type Language = 'en' | 'hy' | 'ru';

interface TranslationCache {
  [key: string]: {
    [targetLang: string]: string;
  };
}

interface TranslatableText {
  textNode: Text;
  originalText: string;
  cacheKey: string;
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

  private collectTranslatables(): TranslatableText[] {
    const textNodes: TranslatableText[] = [];
    const seenTexts = new Set<string>();

    // Recursively walk document.body to find all Text nodes
    const walkTextNodes = (element: Node) => {
      if (element.nodeType === Node.TEXT_NODE) {
        const textNode = element as Text;
        const text = textNode.nodeValue?.trim();
        
        if (text && text.length > 2 && !seenTexts.has(text)) {
          const parent = textNode.parentElement;
          if (!parent) return;

          // Skip nodes inside excluded tags
          const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA', 'INPUT'];
          if (skipTags.includes(parent.tagName)) {
            return;
          }

          // Skip elements marked as non-translatable
          if (parent.hasAttribute('data-no-translate') || parent.closest('[data-no-translate]')) {
            return;
          }

          // Skip hidden elements
          const style = window.getComputedStyle(parent);
          if (style.display === 'none' || style.visibility === 'hidden') {
            return;
          }

          // Skip pure numbers, URLs, emails, etc.
          if (/^[\d\s\.,\-\+\(\)\[\]]+$/.test(text) || 
              /^https?:\/\//.test(text) || 
              /^[^\s]+@[^\s]+\.[^\s]+$/.test(text)) {
            return;
          }

          seenTexts.add(text);
          
          // Store original content for restoration
          if (!this.originalContent.has(parent)) {
            this.originalContent.set(parent, parent.innerHTML);
          }

          textNodes.push({
            textNode,
            originalText: text,
            cacheKey: text
          });
        }
      } else if (element.nodeType === Node.ELEMENT_NODE) {
        // Recursively process child nodes
        for (let i = 0; i < element.childNodes.length; i++) {
          walkTextNodes(element.childNodes[i]);
        }
      }
    };

    walkTextNodes(document.body);
    return textNodes;
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
      const textNodes = this.collectTranslatables();
      console.log(`📊 Found ${textNodes.length} text nodes`);

      if (textNodes.length === 0) {
        return;
      }

      // Check cache first
      const uncachedNodes = textNodes.filter(({ cacheKey }) => 
        !this.cache[cacheKey]?.[targetLang]
      );

      if (uncachedNodes.length > 0) {
        console.log(`🔄 Translating ${uncachedNodes.length} new texts`);
        await this.translateBatch(uncachedNodes, targetLang);
      }

      // Apply all translations to text nodes
      this.applyTranslations(textNodes, targetLang);

    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      this.isTranslating = false;
    }
  }

  private async translateBatch(textNodes: TranslatableText[], targetLang: Language) {
    const batchSize = 10;
    const texts = textNodes.map(node => node.originalText);

    // Process in batches to avoid rate limits
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchNodes = textNodes.slice(i, i + batchSize);
      
      try {
        console.log(`📦 Translating batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`);
        
        const result = await apiClient.invoke('batch-translate', {
          body: {
            texts: batch,
            targetLang,
            context: 'Web application content'
          }
        });

        if (result.error) {
          throw new Error(result.error);
        }

        // Update cache with translations
        Object.entries(result.data.translations).forEach(([original, translated]) => {
          const textNode = batchNodes.find(node => node.originalText === original);
          if (textNode) {
            if (!this.cache[textNode.cacheKey]) {
              this.cache[textNode.cacheKey] = {};
            }
            this.cache[textNode.cacheKey][targetLang] = translated as string;
            console.log(`✅ Translated '${original}' → '${translated}'`);
          }
        });

        this.saveCache();

        // Rate limiting delay between batches
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 1300));
        }

      } catch (error) {
        console.error(`❌ Batch translation failed:`, error);
        // Continue with next batch
      }
    }
  }

  private applyTranslations(textNodes: TranslatableText[], targetLang: Language) {
    textNodes.forEach(({ textNode, originalText, cacheKey }) => {
      const translation = this.cache[cacheKey]?.[targetLang];
      if (translation && translation !== originalText) {
        // Directly update the Text node's nodeValue to preserve HTML structure
        textNode.nodeValue = translation;
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