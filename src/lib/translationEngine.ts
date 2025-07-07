import { apiClient } from '@/lib/apiClient';

export type Language = 'en' | 'hy' | 'ru' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'ar';

interface TranslationCache {
  [key: string]: {
    [targetLang: string]: string;
  };
}

interface TranslatableText {
  textNode: Text;
  originalText: string;
  cacheKey: string;
  isTitle?: boolean;
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
    console.log('🔍 collectTranslatables called');
    const textNodes: TranslatableText[] = [];
    const seenTexts = new Set<string>();

    // Handle document title separately
    if (document.title && document.title.trim().length > 2) {
      const titleText = document.title.trim();
      if (!seenTexts.has(titleText)) {
        seenTexts.add(titleText);
        
        // Create a virtual text node for the title
        const titleNode = document.createTextNode(titleText);
        textNodes.push({
          textNode: titleNode,
          originalText: titleText,
          cacheKey: `title_${titleText}`,
          isTitle: true
        });
      }
    }

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
    
    console.log(`📊 Found ${textNodes.length} text nodes:`, textNodes.map(n => n.originalText.trim()).slice(0,10));
    
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
    const batchSize = 25; // Increased batch size for better performance
    const texts = textNodes.map(node => node.originalText);

    // Process in batches with parallel execution
    const batchPromises = [];
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchNodes = textNodes.slice(i, i + batchSize);
      
      const batchPromise = this.processBatch(batch, batchNodes, targetLang, i, texts.length, batchSize);
      batchPromises.push(batchPromise);
      
      // Add small delay between starting batches to avoid overwhelming the API
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Wait for all batches to complete
    await Promise.allSettled(batchPromises);
    this.saveCache();
  }

  private async processBatch(
    batch: string[], 
    batchNodes: TranslatableText[], 
    targetLang: Language, 
    startIndex: number, 
    totalLength: number, 
    batchSize: number
  ) {
    try {
      console.log(`📦 Translating batch ${Math.floor(startIndex / batchSize) + 1}/${Math.ceil(totalLength / batchSize)}`);
      
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
        }
      });

      console.log(`✅ Batch ${Math.floor(startIndex / batchSize) + 1} completed`);

    } catch (error) {
      console.error(`❌ Batch ${Math.floor(startIndex / batchSize) + 1} failed:`, error);
    }
  }

  private applyTranslations(textNodes: TranslatableText[], targetLang: Language) {
    textNodes.forEach(({ textNode, originalText, cacheKey, isTitle }) => {
      const translation = this.cache[cacheKey]?.[targetLang];
      if (translation && translation !== originalText) {
        console.log(`🔄 Replacing "${originalText}" → "${translation}" on`, textNode);
        if (isTitle) {
          // Update document title
          document.title = translation;
          console.log(`✅ Translated page title: '${originalText}' → '${translation}'`);
        } else {
          // Directly update the Text node's nodeValue to preserve HTML structure
          textNode.nodeValue = translation;
        }
      }
    });
  }

  private restoreOriginalContent() {
    // Restore document title
    const originalTitle = this.originalContent.get(document.head);
    if (originalTitle && typeof originalTitle === 'string') {
      document.title = originalTitle;
    }
    
    // Restore page content
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