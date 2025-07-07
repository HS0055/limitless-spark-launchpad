import { useCallback, useRef, useEffect } from 'react';

interface ContentElement {
  element: Element;
  text: string;
  type: 'text' | 'attribute';
  attribute?: string;
  context: string;
  priority: number;
  isVisible: boolean;
}

interface DetectionOptions {
  includeHidden: boolean;
  watchMutations: boolean;
  debounceMs: number;
  excludeSelectors: string[];
}

const DEFAULT_OPTIONS: DetectionOptions = {
  includeHidden: false,
  watchMutations: true,
  debounceMs: 500,
  excludeSelectors: [
    'script', 'style', 'noscript', 'code', 'pre',
    '[data-no-translate]', '.no-translate'
  ]
};

export const useAdvancedContentDetection = (
  options: Partial<DetectionOptions> = {}
) => {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };
  const mutationObserver = useRef<MutationObserver | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastScanHash = useRef<string>('');

  // Check if element should be excluded
  const shouldExclude = useCallback((element: Element): boolean => {
    // Check exclude selectors
    for (const selector of finalOptions.excludeSelectors) {
      if (element.matches?.(selector) || element.closest?.(selector)) {
        return true;
      }
    }

    // Check for data attributes that indicate non-translatable content
    if (element.hasAttribute('data-no-translate') || 
        element.hasAttribute('translate') && element.getAttribute('translate') === 'no') {
      return true;
    }

    // Check for specific patterns in classes or IDs
    const classStr = element.className?.toString() || '';
    const idStr = element.id || '';
    
    const skipPatterns = [
      /code|syntax|highlight|token/i,
      /uuid|id-\d+|hash/i,
      /timestamp|datetime/i,
      /version|build-\d+/i
    ];

    return skipPatterns.some(pattern => 
      pattern.test(classStr) || pattern.test(idStr)
    );
  }, [finalOptions.excludeSelectors]);

  // Check if text should be translated
  const shouldTranslateText = useCallback((text: string): boolean => {
    if (!text || text.trim().length < 2) return false;

    // Skip pure numbers, dates, and technical strings
    const skipPatterns = [
      /^\d+$/,                           // Pure numbers
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,    // Dates
      /^[a-f0-9-]{8,}$/i,               // UUIDs/hashes
      /^[A-Z_]+$/,                      // Constants
      /^[a-z-_]+$/,                     // CSS classes/IDs
      /^https?:\/\//,                   // URLs
      /^[#.][\w-]+$/,                   // CSS selectors
      /^\$[\w.-]+$/,                    // Variables
      /^@[\w.-]+$/,                     // Handles/mentions
      /^\/[\w\/.-]*$/,                  // Paths
      /^\w+\(\)/,                       // Function calls
      /^console\./,                     // Console methods
      /^JSON\./,                        // JSON methods
    ];

    return !skipPatterns.some(pattern => pattern.test(text.trim()));
  }, []);

  // Calculate element priority based on visibility and importance
  const calculatePriority = useCallback((element: Element): number => {
    let priority = 1;

    // Viewport visibility
    const rect = element.getBoundingClientRect();
    if (rect.top >= 0 && rect.top <= window.innerHeight) {
      priority += 10; // Visible elements get higher priority
    }

    // Element importance
    const tagName = element.tagName.toLowerCase();
    switch (tagName) {
      case 'h1': priority += 8; break;
      case 'h2': priority += 7; break;
      case 'h3': priority += 6; break;
      case 'h4': case 'h5': case 'h6': priority += 5; break;
      case 'p': priority += 4; break;
      case 'span': case 'div': priority += 2; break;
      case 'button': case 'a': priority += 6; break;
      case 'label': priority += 5; break;
      case 'td': case 'th': priority += 3; break;
      default: priority += 1;
    }

    // Text length (longer text gets higher priority)
    const textLength = element.textContent?.length || 0;
    if (textLength > 100) priority += 3;
    else if (textLength > 50) priority += 2;
    else if (textLength > 20) priority += 1;

    // Special attributes
    if (element.hasAttribute('aria-label') || element.hasAttribute('title')) {
      priority += 4;
    }

    return priority;
  }, []);

  // Check if element is visible
  const isElementVisible = useCallback((element: Element): boolean => {
    if (!finalOptions.includeHidden) {
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || 
          style.visibility === 'hidden' || 
          style.opacity === '0') {
        return false;
      }
    }

    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }, [finalOptions.includeHidden]);

  // Extract text content from elements
  const extractTextContent = useCallback((): ContentElement[] => {
    const contentElements: ContentElement[] = [];
    const processedElements = new Set<Element>();

    // Create tree walker for text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent || shouldExclude(parent)) {
            return NodeFilter.FILTER_REJECT;
          }

          const text = node.textContent?.trim() || '';
          if (!shouldTranslateText(text)) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    // Process text nodes
    let node;
    while (node = walker.nextNode()) {
      const element = node.parentElement!;
      const text = node.textContent!.trim();

      if (!processedElements.has(element)) {
        processedElements.add(element);
        
        contentElements.push({
          element,
          text,
          type: 'text',
          context: `${element.tagName.toLowerCase()}-text`,
          priority: calculatePriority(element),
          isVisible: isElementVisible(element)
        });
      }
    }

    // Process attribute content
    const attributeSelectors = [
      { selector: '[alt]', attribute: 'alt' },
      { selector: '[title]', attribute: 'title' },
      { selector: '[placeholder]', attribute: 'placeholder' },
      { selector: '[aria-label]', attribute: 'aria-label' },
      { selector: '[aria-description]', attribute: 'aria-description' },
      { selector: '[data-tooltip]', attribute: 'data-tooltip' },
    ];

    attributeSelectors.forEach(({ selector, attribute }) => {
      document.querySelectorAll(selector).forEach(element => {
        if (shouldExclude(element)) return;

        const value = element.getAttribute(attribute);
        if (value && shouldTranslateText(value)) {
          contentElements.push({
            element,
            text: value,
            type: 'attribute',
            attribute,
            context: `${element.tagName.toLowerCase()}-${attribute}`,
            priority: calculatePriority(element),
            isVisible: isElementVisible(element)
          });
        }
      });
    });

    return contentElements;
  }, [shouldExclude, shouldTranslateText, calculatePriority, isElementVisible]);

  // Generate content hash for change detection
  const generateContentHash = useCallback((content: ContentElement[]): string => {
    const textContent = content
      .map(item => `${item.text}-${item.context}`)
      .sort()
      .join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < textContent.length; i++) {
      const char = textContent.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }, []);

  // Debounced content detection
  const debouncedDetection = useCallback((callback: (content: ContentElement[]) => void) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const content = extractTextContent();
      const contentHash = generateContentHash(content);
      
      // Only trigger callback if content actually changed
      if (contentHash !== lastScanHash.current) {
        lastScanHash.current = contentHash;
        callback(content);
      }
    }, finalOptions.debounceMs);
  }, [extractTextContent, generateContentHash, finalOptions.debounceMs]);

  // Setup mutation observer
  const setupMutationObserver = useCallback((callback: (content: ContentElement[]) => void) => {
    if (!finalOptions.watchMutations) return;

    mutationObserver.current = new MutationObserver((mutations) => {
      let shouldRescan = false;

      mutations.forEach((mutation) => {
        // Check for text changes
        if (mutation.type === 'characterData') {
          shouldRescan = true;
        }
        
        // Check for DOM structure changes
        if (mutation.type === 'childList') {
          const hasTextNodes = Array.from(mutation.addedNodes).some(
            node => node.nodeType === Node.TEXT_NODE || 
                   (node.nodeType === Node.ELEMENT_NODE && (node as Element).textContent)
          );
          if (hasTextNodes) shouldRescan = true;
        }

        // Check for attribute changes
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          const attributeName = mutation.attributeName;
          
          if (attributeName && ['alt', 'title', 'placeholder', 'aria-label', 'aria-description'].includes(attributeName)) {
            shouldRescan = true;
          }
        }
      });

      if (shouldRescan) {
        debouncedDetection(callback);
      }
    });

    mutationObserver.current.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['alt', 'title', 'placeholder', 'aria-label', 'aria-description']
    });
  }, [finalOptions.watchMutations, debouncedDetection]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (mutationObserver.current) {
      mutationObserver.current.disconnect();
      mutationObserver.current = null;
    }
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
  }, []);

  // Detect content with optional live updates
  const detectContent = useCallback((
    callback?: (content: ContentElement[]) => void,
    enableLiveUpdates: boolean = false
  ): ContentElement[] => {
    const content = extractTextContent();
    
    if (callback) {
      callback(content);
      
      if (enableLiveUpdates) {
        setupMutationObserver(callback);
      }
    }
    
    return content;
  }, [extractTextContent, setupMutationObserver]);

  // Filter content by priority and visibility
  const filterByPriority = useCallback((
    content: ContentElement[],
    minPriority: number = 1,
    visibleOnly: boolean = true
  ): ContentElement[] => {
    return content
      .filter(item => item.priority >= minPriority)
      .filter(item => !visibleOnly || item.isVisible)
      .sort((a, b) => b.priority - a.priority);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    detectContent,
    filterByPriority,
    cleanup,
    shouldTranslateText,
    isElementVisible
  };
};