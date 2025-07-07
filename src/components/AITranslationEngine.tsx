import { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/components/auth/AuthProvider';

interface TranslationEngine {
  isActive: boolean;
  isProcessing: boolean;
  totalElements: number;
  processedElements: number;
  errorCount: number;
  lastError?: string;
}

interface TranslationMetrics {
  accuracy: number;
  speed: number;
  coverage: number;
  errorRate: number;
}

interface ContentElement {
  element: Element;
  originalText: string;
  translatedText?: string;
  context: string;
  priority: number;
  retryCount: number;
  lastUpdated: number;
}

export const AITranslationEngine = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [engine, setEngine] = useState<TranslationEngine>({
    isActive: false,
    isProcessing: false,
    totalElements: 0,
    processedElements: 0,
    errorCount: 0
  });
  
  const [metrics, setMetrics] = useState<TranslationMetrics>({
    accuracy: 0,
    speed: 0,
    coverage: 0,
    errorRate: 0
  });

  const contentMap = useRef<Map<string, ContentElement>>(new Map());
  const observer = useRef<MutationObserver | null>(null);
  const processingQueue = useRef<ContentElement[]>([]);
  const translationCache = useRef<Map<string, string>>(new Map());
  const errorPatterns = useRef<Set<string>>(new Set());
  const isInitialized = useRef(false);

  // Advanced Content Detection with AI Vision Context
  const detectAllContent = useCallback((): ContentElement[] => {
    const elements: ContentElement[] = [];
    const processedNodes = new Set<Node>();

    // Enhanced content detection with comprehensive selectors
    const contentSelectors = [
      // Text content
      'h1, h2, h3, h4, h5, h6', 'p', 'span', 'div', 'a', 'strong', 'em', 'small',
      // Form elements
      'input[type="text"], input[type="email"], input[type="password"]',
      'textarea', 'select option', 'label',
      // Interactive elements
      'button', '[role="button"]', '[aria-label]',
      // Navigation
      'nav a', '.nav-link', '[role="navigation"] *',
      // Content areas
      'main *', 'article *', 'section *', 'aside *',
      // Dynamic content
      '[data-translate]', '.translatable', '[translate="yes"]'
    ];

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (processedNodes.has(node)) return NodeFilter.FILTER_REJECT;
          
          if (node.nodeType === Node.TEXT_NODE) {
            const parent = node.parentElement;
            if (!parent || processedNodes.has(parent)) return NodeFilter.FILTER_REJECT;
            
            // Skip technical elements
            const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE'];
            if (skipTags.includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
            
            // Skip hidden elements
            const style = window.getComputedStyle(parent);
            if (style.display === 'none' || style.visibility === 'hidden') {
              return NodeFilter.FILTER_REJECT;
            }
            
            // Skip already translated or non-translatable elements
            if (parent.hasAttribute('data-no-translate') || 
                parent.closest('[data-no-translate]') ||
                parent.hasAttribute('data-translated')) {
              return NodeFilter.FILTER_REJECT;
            }
            
            const text = node.textContent?.trim();
            if (!text || text.length < 1) return NodeFilter.FILTER_REJECT;
            
            // Advanced text filtering
            if (/^[\d\s\.,\-\+\(\)\[\]\/\\]+$/.test(text) || 
                /^https?:\/\//.test(text) || 
                /^[^\s]+@[^\s]+\.[^\s]+$/.test(text) ||
                text.startsWith('//') || text.startsWith('/*') ||
                /^[\{\}\[\]\(\)\<\>\/\\]+$/.test(text)) {
              return NodeFilter.FILTER_REJECT;
            }
            
            return NodeFilter.FILTER_ACCEPT;
          }
          
          // Handle element attributes
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const translatableAttrs = ['title', 'alt', 'placeholder', 'aria-label', 'aria-description'];
            
            for (const attr of translatableAttrs) {
              const value = element.getAttribute(attr);
              if (value && value.trim().length > 1 && !processedNodes.has(element)) {
                return NodeFilter.FILTER_ACCEPT;
              }
            }
          }
          
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      if (processedNodes.has(node)) continue;
      
      if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement;
        if (!parent || processedNodes.has(parent)) continue;
        
        const text = node.textContent?.trim();
        if (!text) continue;
        
        processedNodes.add(parent);
        processedNodes.add(node);
        
        const context = analyzeElementContext(parent);
        const priority = calculatePriority(parent, context);
        
        elements.push({
          element: parent,
          originalText: text,
          context,
          priority,
          retryCount: 0,
          lastUpdated: Date.now()
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (processedNodes.has(element)) continue;
        
        const translatableAttrs = ['title', 'alt', 'placeholder', 'aria-label', 'aria-description'];
        
        for (const attr of translatableAttrs) {
          const value = element.getAttribute(attr);
          if (value && value.trim().length > 1) {
            processedNodes.add(element);
            
            const context = `${analyzeElementContext(element)}, ${attr} attribute`;
            const priority = calculatePriority(element, context);
            
            elements.push({
              element,
              originalText: value,
              context,
              priority,
              retryCount: 0,
              lastUpdated: Date.now()
            });
            break;
          }
        }
      }
    }

    // Sort by priority (higher first)
    return elements.sort((a, b) => b.priority - a.priority);
  }, []);

  // AI Vision Context Analysis
  const analyzeElementContext = (element: Element): string => {
    const contexts = [];
    
    // Semantic analysis
    const tagName = element.tagName.toLowerCase();
    const semanticTags: Record<string, string> = {
      'h1': 'main heading', 'h2': 'section heading', 'h3': 'subsection heading',
      'p': 'paragraph', 'button': 'interactive button', 'a': 'navigation link',
      'nav': 'navigation menu', 'header': 'page header', 'footer': 'page footer',
      'main': 'main content', 'aside': 'sidebar', 'article': 'article content',
      'section': 'content section', 'span': 'inline text', 'div': 'content block',
      'li': 'list item', 'td': 'table data', 'th': 'table header',
      'label': 'form label', 'input': 'form input'
    };
    
    if (semanticTags[tagName]) contexts.push(semanticTags[tagName]);
    
    // CSS class analysis
    const className = element.className || '';
    const classKeywords = {
      'nav': 'navigation', 'menu': 'menu', 'btn': 'button', 'button': 'button',
      'title': 'title', 'heading': 'heading', 'desc': 'description',
      'card': 'card content', 'hero': 'hero section', 'footer': 'footer',
      'header': 'header', 'price': 'pricing', 'cta': 'call to action',
      'feature': 'feature description', 'benefit': 'benefit statement'
    };
    
    Object.entries(classKeywords).forEach(([cls, context]) => {
      if (className.includes(cls)) contexts.push(context);
    });
    
    // Position analysis
    try {
      const rect = element.getBoundingClientRect();
      if (rect.top < 200) contexts.push('top section');
      if (rect.bottom > window.innerHeight - 200) contexts.push('bottom section');
      if (rect.left < 100) contexts.push('left side');
      if (rect.right > window.innerWidth - 100) contexts.push('right side');
    } catch (e) {
      // Skip if getBoundingClientRect fails
    }
    
    // Parent context analysis
    let parent = element.parentElement;
    let depth = 0;
    while (parent && parent !== document.body && depth < 3) {
      const parentTag = parent.tagName.toLowerCase();
      const parentClass = parent.className || '';
      
      if (parentTag === 'nav') contexts.push('navigation area');
      if (parentTag === 'header') contexts.push('header area');
      if (parentTag === 'footer') contexts.push('footer area');
      if (parentTag === 'main') contexts.push('main content area');
      if (parentClass.includes('hero')) contexts.push('hero section');
      if (parentClass.includes('card')) contexts.push('card component');
      
      parent = parent.parentElement;
      depth++;
    }
    
    return contexts.length > 0 ? contexts.join(', ') : 'general content';
  };

  // Priority calculation for processing order
  const calculatePriority = (element: Element, context: string): number => {
    let priority = 50; // Base priority
    
    // Element type priority
    const tagName = element.tagName.toLowerCase();
    const tagPriorities: Record<string, number> = {
      'h1': 100, 'h2': 90, 'h3': 80, 'h4': 70, 'h5': 60, 'h6': 50,
      'button': 85, 'a': 75, 'p': 60, 'span': 40, 'div': 30
    };
    
    priority += tagPriorities[tagName] || 0;
    
    // Visibility priority
    try {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (isVisible) priority += 30;
      
      // Above the fold gets higher priority
      if (rect.top < window.innerHeight / 2) priority += 20;
    } catch (e) {
      // Default to visible if we can't determine
      priority += 15;
    }
    
    // Context-based priority
    if (context.includes('navigation')) priority += 25;
    if (context.includes('button')) priority += 20;
    if (context.includes('heading')) priority += 15;
    if (context.includes('hero')) priority += 30;
    if (context.includes('cta')) priority += 25;
    
    // Text length penalty (longer text = lower priority for immediate processing)
    const text = element.textContent?.trim() || '';
    if (text.length > 100) priority -= 10;
    if (text.length > 200) priority -= 15;
    
    return Math.max(0, Math.min(200, priority));
  };

  // Enhanced multi-model translation with better error handling
  const translateWithAI = useCallback(async (
    text: string, 
    targetLang: string, 
    context: string,
    retryCount: number = 0
  ): Promise<string> => {
    const cacheKey = `${text.toLowerCase().trim()}_${context}_${targetLang}`;
    
    // Check cache first
    if (translationCache.current.has(cacheKey)) {
      return translationCache.current.get(cacheKey)!;
    }
    
    // Skip problematic patterns to prevent chaos
    const errorPattern = `${text.substring(0, 20)}_${context}`;
    if (errorPatterns.current.has(errorPattern) && retryCount === 0) {
      // Return original text immediately for known problematic patterns
      return text;
    }
    
    // Use simpler, more reliable approach
    try {
      const result = await apiClient.invoke('ai-translate', {
        body: {
          text: text.trim(),
          sourceLang: 'en',
          targetLang,
          context: context.substring(0, 100), // Limit context length
          visionMode: false // Disable vision mode for stability
        }
      }, {
        ttl: 60000, // Shorter TTL for faster failover
        skipCache: retryCount > 0
      });
      
      if (result.data?.translatedText && result.data.translatedText.trim()) {
        const translated = result.data.translatedText.trim();
        
        // Validate translation quality
        if (translated.length > 0 && translated !== text) {
          translationCache.current.set(cacheKey, translated);
          // Clear error pattern on success
          errorPatterns.current.delete(errorPattern);
          return translated;
        }
      }
      
      throw new Error('Invalid translation response');
    } catch (error) {
      console.warn(`Translation attempt ${retryCount + 1} failed:`, error);
      
      // Mark as problematic
      errorPatterns.current.add(errorPattern);
      
      // Single retry with different approach
      if (retryCount === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          const simpleResult = await apiClient.invoke('ai-translate', {
            body: {
              text: text.trim(),
              sourceLang: 'en',
              targetLang,
              detectOnly: false
            }
          }, {
            ttl: 30000,
            skipCache: true
          });
          
          if (simpleResult.data?.translatedText?.trim()) {
            const translated = simpleResult.data.translatedText.trim();
            translationCache.current.set(cacheKey, translated);
            return translated;
          }
        } catch (retryError) {
          console.warn('Retry also failed:', retryError);
        }
      }
      
      // Return original text to maintain consistency
      return text;
    }
  }, []);

  // Process translation queue with stable batching
  const processTranslationQueue = useCallback(async () => {
    if (processingQueue.current.length === 0 || engine.isProcessing) return;
    
    setEngine(prev => ({ ...prev, isProcessing: true }));
    
    const startTime = Date.now();
    const batchSize = 3; // Smaller, more stable batch size
    let processed = 0;
    let errors = 0;
    
    while (processingQueue.current.length > 0) {
      const batch = processingQueue.current.splice(0, batchSize);
      
      // Process sequentially to avoid overwhelming the API
      for (const item of batch) {
        try {
          // Skip if already processed or problematic
          if (item.element.hasAttribute('data-translated') || item.retryCount > 2) {
            continue;
          }
          
          const translated = await translateWithAI(
            item.originalText,
            language,
            item.context,
            item.retryCount
          );
          
          // Only apply if translation is different and valid
          if (translated && translated !== item.originalText && translated.trim().length > 0) {
            item.translatedText = translated;
            
            // Apply translation to DOM safely
            try {
              if (item.context.includes('attribute')) {
                const attrMatch = item.context.match(/(title|alt|placeholder|aria-label|aria-description) attribute/);
                if (attrMatch) {
                  const attrName = attrMatch[1];
                  if (item.element.getAttribute(attrName) === item.originalText) {
                    item.element.setAttribute(attrName, translated);
                    item.element.setAttribute('data-translated', 'true');
                  }
                }
              } else {
                // Only update if content still matches original
                const currentText = item.element.textContent?.trim();
                if (currentText === item.originalText.trim()) {
                  item.element.textContent = translated;
                  item.element.setAttribute('data-translated', 'true');
                }
              }
              
              processed++;
            } catch (domError) {
              console.warn('DOM update failed:', domError);
              errors++;
            }
          }
          
          // Small delay between translations
          await new Promise(resolve => setTimeout(resolve, 50));
          
        } catch (error) {
          console.warn('Translation error:', error);
          errors++;
          item.retryCount++;
          
          // Only retry high-priority items once
          if (item.retryCount === 1 && item.priority > 80) {
            processingQueue.current.push(item);
          }
        }
      }
      
      // Update metrics
      setEngine(prev => ({
        ...prev,
        processedElements: prev.processedElements + processed,
        errorCount: prev.errorCount + errors
      }));
      
      // Longer delay between batches for stability
      if (processingQueue.current.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Update performance metrics and signal completion
    setMetrics(prev => ({
      accuracy: Math.max(0, (processed - errors) / Math.max(processed, 1)) * 100,
      speed: processed / (duration / 1000),
      coverage: (engine.processedElements / Math.max(engine.totalElements, 1)) * 100,
      errorRate: (errors / Math.max(processed, 1)) * 100
    }));
    
    setEngine(prev => ({ ...prev, isProcessing: false }));
    
    // Signal completion to LanguageContext
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('translationComplete'));
    }, 100);
  }, [language, engine.isProcessing, translateWithAI]);

  // Initialize translation engine
  const initializeEngine = useCallback(async () => {
    if (isInitialized.current || language === 'en') return;
    
    isInitialized.current = true;
    
    setEngine(prev => ({ ...prev, isActive: true }));
    
    // Detect all content
    const elements = detectAllContent();
    
    setEngine(prev => ({ 
      ...prev, 
      totalElements: elements.length,
      processedElements: 0,
      errorCount: 0
    }));
    
    // Add to processing queue
    processingQueue.current = [...elements];
    
    // Start processing
    await processTranslationQueue();
    
    // Set up mutation observer for dynamic content
    if (observer.current) {
      observer.current.disconnect();
    }
    
    observer.current = new MutationObserver((mutations) => {
      let hasNewContent = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              const newElements = detectAllContent();
              const unprocessedElements = newElements.filter(item => 
                !item.element.hasAttribute('data-translated')
              );
              
              if (unprocessedElements.length > 0) {
                processingQueue.current.push(...unprocessedElements);
                hasNewContent = true;
              }
            }
          });
        }
      });
      
      if (hasNewContent) {
        processTranslationQueue();
      }
    });
    
    observer.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
    });
  }, [language, detectAllContent, processTranslationQueue]);

  // Integration with language context
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const { targetLang, source } = event.detail;
      
      if (targetLang === 'en') {
        // Restore original content
        document.querySelectorAll('[data-translated]').forEach(element => {
          element.removeAttribute('data-translated');
        });
        
        setEngine(prev => ({ ...prev, isActive: false, isProcessing: false }));
        isInitialized.current = false;
        
        if (observer.current) {
          observer.current.disconnect();
        }
        
        return;
      }
      
      // Only reinitialize if language actually changed
      if (targetLang !== language) {
        // Reset state
        isInitialized.current = false;
        processingQueue.current = [];
        
        // Don't clear cache if restoring from cache
        if (source !== 'cache') {
          translationCache.current.clear();
        }
        
        setTimeout(() => {
          initializeEngine();
        }, 100);
      }
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, [language, initializeEngine]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  // This component operates invisibly - no UI rendering
  return null;
};

export default AITranslationEngine;