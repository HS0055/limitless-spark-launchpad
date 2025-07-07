/**
 * Advanced Content Detection Engine
 * Intelligently scans and identifies all translatable content on any page/dashboard
 */

export interface DetectedContent {
  id: string;
  element: Element;
  originalText: string;
  contentType: ContentType;
  context: ContentContext;
  priority: number;
  isVisible: boolean;
  attributes?: Record<string, string>;
  metadata: ContentMetadata;
}

export type ContentType = 
  | 'text' | 'heading' | 'button' | 'link' | 'label' 
  | 'placeholder' | 'alt' | 'title' | 'aria-label' 
  | 'option' | 'meta' | 'tooltip' | 'notification';

export interface ContentContext {
  page: string;
  component?: string;
  section?: string;
  role?: string;
  semantic?: string;
}

export interface ContentMetadata {
  wordCount: number;
  complexity: 'simple' | 'medium' | 'complex';
  domain: 'general' | 'technical' | 'business' | 'ui';
  lastUpdated: number;
  frequency: number;
}

export class ContentDetector {
  private contentMap = new Map<string, DetectedContent>();
  private observerActive = false;
  private mutationObserver?: MutationObserver;
  private intersectionObserver?: IntersectionObserver;
  
  // Content patterns to exclude from translation
  private readonly EXCLUDE_PATTERNS = [
    /^[a-f0-9-]{8,}$/i,           // UUIDs/hashes
    /^\d+(\.\d+)*$/,              // Version numbers
    /^[A-Z_]{2,}$/,               // Constants
    /^[a-z-_]+$/,                 // CSS classes/IDs
    /^https?:\/\//,               // URLs
    /^[#.][\w-]+$/,               // Selectors
    /^\$[\w.-]+$/,                // Variables
    /^@[\w.-]+$/,                 // Mentions/handles
    /^\/[\w\/.-]*$/,              // Paths
    /^\w+\(\)/,                   // Function calls
    /^console\./,                 // Console methods
    /^JSON\./,                    // JSON methods
    /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/, // Dates
  ];

  // High-priority selectors for important content
  private readonly PRIORITY_SELECTORS = [
    { selector: 'h1, h2, h3', priority: 10, type: 'heading' as ContentType },
    { selector: '[data-testid*="title"], [data-title]', priority: 9, type: 'heading' as ContentType },
    { selector: 'button, [role="button"]', priority: 8, type: 'button' as ContentType },
    { selector: 'a[href], [role="link"]', priority: 7, type: 'link' as ContentType },
    { selector: 'label, [for]', priority: 7, type: 'label' as ContentType },
    { selector: '[data-tooltip], [title]', priority: 6, type: 'tooltip' as ContentType },
    { selector: 'p, span, div', priority: 4, type: 'text' as ContentType },
    { selector: '[role="alert"], [role="status"]', priority: 9, type: 'notification' as ContentType },
  ];

  constructor() {
    this.setupIntersectionObserver();
  }

  /**
   * Main detection method - scans entire page for translatable content
   */
  async detectAllContent(options: {
    includeHidden?: boolean;
    watchChanges?: boolean;
    prioritizeVisible?: boolean;
  } = {}): Promise<DetectedContent[]> {
    const { includeHidden = false, watchChanges = true, prioritizeVisible = true } = options;
    
    console.log('🔍 Starting comprehensive content detection...');
    
    // Clear previous content
    this.contentMap.clear();
    
    // Detect different types of content
    await Promise.all([
      this.detectTextContent(includeHidden),
      this.detectAttributeContent(),
      this.detectFormElements(),
      this.detectMetaContent(),
      this.detectAriaContent(),
      this.detectReactContent(),
    ]);

    // Setup mutation observer for dynamic content
    if (watchChanges && !this.observerActive) {
      this.setupMutationObserver();
    }

    // Convert to array and sort by priority
    const allContent = Array.from(this.contentMap.values());
    
    if (prioritizeVisible) {
      allContent.sort((a, b) => {
        if (a.isVisible !== b.isVisible) {
          return a.isVisible ? -1 : 1;
        }
        return b.priority - a.priority;
      });
    }

    console.log(`✅ Detected ${allContent.length} translatable content items`);
    return allContent;
  }

  /**
   * Detect text content in DOM elements
   */
  private async detectTextContent(includeHidden: boolean): Promise<void> {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          // Skip excluded elements
          if (this.shouldExcludeElement(parent)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          const text = node.textContent?.trim() || '';
          if (!this.isTranslatableText(text)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Check visibility
          if (!includeHidden && !this.isElementVisible(parent)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      const element = node.parentElement!;
      const text = node.textContent!.trim();
      
      const contentId = this.generateContentId(text, element);
      if (!this.contentMap.has(contentId)) {
        const detectedContent = this.createDetectedContent(
          contentId,
          element,
          text,
          this.getContentType(element),
          this.getElementContext(element)
        );
        
        this.contentMap.set(contentId, detectedContent);
      }
    }
  }

  /**
   * Detect translatable attributes (alt, title, placeholder, etc.)
   */
  private async detectAttributeContent(): Promise<void> {
    const attributeSelectors = [
      { attribute: 'alt', type: 'alt' as ContentType },
      { attribute: 'title', type: 'title' as ContentType },
      { attribute: 'placeholder', type: 'placeholder' as ContentType },
      { attribute: 'aria-label', type: 'aria-label' as ContentType },
      { attribute: 'aria-description', type: 'aria-label' as ContentType },
      { attribute: 'data-tooltip', type: 'tooltip' as ContentType },
      { attribute: 'data-hint', type: 'tooltip' as ContentType },
    ];

    for (const { attribute, type } of attributeSelectors) {
      const elements = document.querySelectorAll(`[${attribute}]`);
      
      elements.forEach(element => {
        if (this.shouldExcludeElement(element)) return;
        
        const value = element.getAttribute(attribute);
        if (value && this.isTranslatableText(value)) {
          const contentId = this.generateContentId(value, element, attribute);
          
          if (!this.contentMap.has(contentId)) {
            const detectedContent = this.createDetectedContent(
              contentId,
              element,
              value,
              type,
              this.getElementContext(element),
              { [attribute]: value }
            );
            
            this.contentMap.set(contentId, detectedContent);
          }
        }
      });
    }
  }

  /**
   * Detect form elements and their labels
   */
  private async detectFormElements(): Promise<void> {
    // Input placeholders
    const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
    inputs.forEach(input => {
      const placeholder = input.getAttribute('placeholder');
      if (placeholder && this.isTranslatableText(placeholder)) {
        const contentId = this.generateContentId(placeholder, input, 'placeholder');
        
        if (!this.contentMap.has(contentId)) {
          const detectedContent = this.createDetectedContent(
            contentId,
            input,
            placeholder,
            'placeholder',
            this.getElementContext(input),
            { placeholder }
          );
          
          this.contentMap.set(contentId, detectedContent);
        }
      }
    });

    // Select options
    const options = document.querySelectorAll('option');
    options.forEach(option => {
      const text = option.textContent?.trim();
      if (text && this.isTranslatableText(text)) {
        const contentId = this.generateContentId(text, option);
        
        if (!this.contentMap.has(contentId)) {
          const detectedContent = this.createDetectedContent(
            contentId,
            option,
            text,
            'option',
            this.getElementContext(option)
          );
          
          this.contentMap.set(contentId, detectedContent);
        }
      }
    });
  }

  /**
   * Detect meta content (titles, descriptions)
   */
  private async detectMetaContent(): Promise<void> {
    // Page title
    const title = document.querySelector('title');
    if (title?.textContent?.trim()) {
      const text = title.textContent.trim();
      if (this.isTranslatableText(text)) {
        const contentId = this.generateContentId(text, title);
        
        const detectedContent = this.createDetectedContent(
          contentId,
          title,
          text,
          'meta',
          { page: window.location.pathname, semantic: 'title' }
        );
        
        this.contentMap.set(contentId, detectedContent);
      }
    }

    // Meta descriptions
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      const content = metaDesc.getAttribute('content');
      if (content && this.isTranslatableText(content)) {
        const contentId = this.generateContentId(content, metaDesc, 'content');
        
        const detectedContent = this.createDetectedContent(
          contentId,
          metaDesc,
          content,
          'meta',
          { page: window.location.pathname, semantic: 'description' },
          { content }
        );
        
        this.contentMap.set(contentId, detectedContent);
      }
    }
  }

  /**
   * Detect ARIA content for accessibility
   */
  private async detectAriaContent(): Promise<void> {
    const ariaSelectors = [
      '[aria-label]',
      '[aria-description]',
      '[aria-valuetext]',
      '[role="status"]',
      '[role="alert"]',
    ];

    ariaSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (this.shouldExcludeElement(element)) return;

        // Check aria-label
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel && this.isTranslatableText(ariaLabel)) {
          const contentId = this.generateContentId(ariaLabel, element, 'aria-label');
          
          if (!this.contentMap.has(contentId)) {
            const detectedContent = this.createDetectedContent(
              contentId,
              element,
              ariaLabel,
              'aria-label',
              this.getElementContext(element),
              { 'aria-label': ariaLabel }
            );
            
            this.contentMap.set(contentId, detectedContent);
          }
        }

        // Check text content for status/alert roles
        const role = element.getAttribute('role');
        if ((role === 'status' || role === 'alert') && element.textContent?.trim()) {
          const text = element.textContent.trim();
          if (this.isTranslatableText(text)) {
            const contentId = this.generateContentId(text, element);
            
            if (!this.contentMap.has(contentId)) {
              const detectedContent = this.createDetectedContent(
                contentId,
                element,
                text,
                'notification',
                this.getElementContext(element)
              );
              
              this.contentMap.set(contentId, detectedContent);
            }
          }
        }
      });
    });
  }

  /**
   * Detect React component content and data attributes
   */
  private async detectReactContent(): Promise<void> {
    // Look for React-specific data attributes
    const reactSelectors = [
      '[data-testid]',
      '[data-label]',
      '[data-title]',
      '[data-description]',
      '[data-text]',
    ];

    reactSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (this.shouldExcludeElement(element)) return;

        // Check data attributes
        const dataAttrs = ['data-label', 'data-title', 'data-description', 'data-text'];
        dataAttrs.forEach(attr => {
          const value = element.getAttribute(attr);
          if (value && this.isTranslatableText(value)) {
            const contentId = this.generateContentId(value, element, attr);
            
            if (!this.contentMap.has(contentId)) {
              const detectedContent = this.createDetectedContent(
                contentId,
                element,
                value,
                'text',
                this.getElementContext(element),
                { [attr]: value }
              );
              
              this.contentMap.set(contentId, detectedContent);
            }
          }
        });
      });
    });
  }

  /**
   * Generate unique content ID
   */
  private generateContentId(text: string, element: Element, attribute?: string): string {
    const tagName = element.tagName.toLowerCase();
    const className = element.className ? `.${element.className.split(' ').join('.')}` : '';
    const id = element.id ? `#${element.id}` : '';
    const attr = attribute ? `[${attribute}]` : '';
    
    // Create a hash of the text content
    const textHash = btoa(text).substring(0, 8);
    
    return `${tagName}${id}${className}${attr}-${textHash}`;
  }

  /**
   * Create detected content object
   */
  private createDetectedContent(
    id: string,
    element: Element,
    text: string,
    type: ContentType,
    context: ContentContext,
    attributes?: Record<string, string>
  ): DetectedContent {
    return {
      id,
      element,
      originalText: text,
      contentType: type,
      context: {
        page: window.location.pathname,
        component: this.getComponentName(element),
        section: this.getSectionName(element),
        role: element.getAttribute('role') || undefined,
        ...context,
      },
      priority: this.calculatePriority(element, type),
      isVisible: this.isElementVisible(element),
      attributes,
      metadata: {
        wordCount: text.split(/\s+/).length,
        complexity: this.assessComplexity(text),
        domain: this.assessDomain(text, element),
        lastUpdated: Date.now(),
        frequency: 1,
      },
    };
  }

  /**
   * Check if text should be translated
   */
  private isTranslatableText(text: string): boolean {
    if (!text || text.trim().length < 2) return false;
    
    const cleanText = text.trim();
    
    // Skip if matches exclude patterns
    return !this.EXCLUDE_PATTERNS.some(pattern => pattern.test(cleanText));
  }

  /**
   * Check if element should be excluded
   */
  private shouldExcludeElement(element: Element): boolean {
    const tagName = element.tagName.toLowerCase();
    
    // Skip certain tags
    if (['script', 'style', 'noscript', 'code', 'pre'].includes(tagName)) {
      return true;
    }
    
    // Skip elements marked as no-translate
    if (element.hasAttribute('data-no-translate') || 
        element.hasAttribute('translate') && element.getAttribute('translate') === 'no' ||
        element.closest('[data-no-translate]') ||
        element.closest('[translate="no"]')) {
      return true;
    }
    
    // Skip hidden elements (unless specifically included)
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return true;
    }
    
    return false;
  }

  /**
   * Check if element is visible in viewport
   */
  private isElementVisible(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && 
           rect.top >= 0 && rect.top <= window.innerHeight;
  }

  /**
   * Calculate content priority
   */
  private calculatePriority(element: Element, type: ContentType): number {
    let priority = 1;
    
    // Base priority by content type
    const typePriorities: Record<ContentType, number> = {
      'heading': 10,
      'button': 8,
      'link': 7,
      'label': 7,
      'notification': 9,
      'tooltip': 6,
      'placeholder': 5,
      'text': 4,
      'alt': 6,
      'title': 6,
      'aria-label': 7,
      'option': 5,
      'meta': 8,
    };
    
    priority += typePriorities[type] || 1;
    
    // Boost for visible elements
    if (this.isElementVisible(element)) {
      priority += 5;
    }
    
    // Boost for important semantic roles
    const role = element.getAttribute('role');
    if (role) {
      const rolePriorities: Record<string, number> = {
        'button': 3,
        'link': 2,
        'alert': 5,
        'status': 4,
        'heading': 4,
        'banner': 3,
        'navigation': 3,
      };
      priority += rolePriorities[role] || 1;
    }
    
    return priority;
  }

  /**
   * Get content type based on element
   */
  private getContentType(element: Element): ContentType {
    const tagName = element.tagName.toLowerCase();
    
    // Check priority selectors first
    for (const { selector, type } of this.PRIORITY_SELECTORS) {
      if (element.matches(selector)) {
        return type;
      }
    }
    
    // Fallback based on tag
    const tagTypes: Record<string, ContentType> = {
      'h1': 'heading', 'h2': 'heading', 'h3': 'heading',
      'h4': 'heading', 'h5': 'heading', 'h6': 'heading',
      'button': 'button',
      'a': 'link',
      'label': 'label',
      'option': 'option',
      'title': 'meta',
    };
    
    return tagTypes[tagName] || 'text';
  }

  /**
   * Get element context information
   */
  private getElementContext(element: Element): ContentContext {
    return {
      page: window.location.pathname,
      component: this.getComponentName(element),
      section: this.getSectionName(element),
      role: element.getAttribute('role') || undefined,
      semantic: this.getSemanticContext(element),
    };
  }

  /**
   * Detect component name from React elements
   */
  private getComponentName(element: Element): string | undefined {
    // Look for React fiber properties or component markers
    const testId = element.getAttribute('data-testid');
    if (testId) {
      return testId.split('-')[0] || testId;
    }
    
    // Look for class names that might indicate component names
    const className = element.className;
    if (className) {
      const componentMatch = className.match(/([A-Z][a-zA-Z0-9]*)/);
      if (componentMatch) {
        return componentMatch[1];
      }
    }
    
    return undefined;
  }

  /**
   * Get section name based on closest landmark
   */
  private getSectionName(element: Element): string | undefined {
    const landmarks = ['header', 'nav', 'main', 'aside', 'footer', 'section', 'article'];
    
    for (const landmark of landmarks) {
      const closest = element.closest(landmark);
      if (closest) {
        return landmark;
      }
    }
    
    return undefined;
  }

  /**
   * Get semantic context
   */
  private getSemanticContext(element: Element): string | undefined {
    const role = element.getAttribute('role');
    if (role) return role;
    
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return 'aria-labeled';
    
    return undefined;
  }

  /**
   * Assess text complexity
   */
  private assessComplexity(text: string): 'simple' | 'medium' | 'complex' {
    const wordCount = text.split(/\s+/).length;
    const avgWordLength = text.length / wordCount;
    
    if (wordCount <= 3 && avgWordLength <= 6) return 'simple';
    if (wordCount <= 10 && avgWordLength <= 8) return 'medium';
    return 'complex';
  }

  /**
   * Assess content domain
   */
  private assessDomain(text: string, element: Element): 'general' | 'technical' | 'business' | 'ui' {
    const lowerText = text.toLowerCase();
    
    // Technical indicators
    if (/\b(api|http|json|xml|sql|css|html|javascript|react|vue|angular)\b/.test(lowerText)) {
      return 'technical';
    }
    
    // Business indicators
    if (/\b(revenue|profit|sales|marketing|strategy|roi|kpi|analytics)\b/.test(lowerText)) {
      return 'business';
    }
    
    // UI indicators
    const uiElements = ['button', 'input', 'label', 'option'];
    if (uiElements.includes(element.tagName.toLowerCase()) || 
        /\b(click|select|choose|enter|submit|cancel|save|delete)\b/.test(lowerText)) {
      return 'ui';
    }
    
    return 'general';
  }

  /**
   * Setup mutation observer for dynamic content
   */
  private setupMutationObserver(): void {
    if (this.observerActive) return;
    
    this.mutationObserver = new MutationObserver((mutations) => {
      let shouldRescan = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if any added nodes contain text
          const hasTextContent = Array.from(mutation.addedNodes).some(node => {
            return node.nodeType === Node.TEXT_NODE && node.textContent?.trim() ||
                   (node.nodeType === Node.ELEMENT_NODE && (node as Element).textContent?.trim());
          });
          
          if (hasTextContent) shouldRescan = true;
        }
        
        if (mutation.type === 'characterData') {
          shouldRescan = true;
        }
        
        if (mutation.type === 'attributes') {
          const target = mutation.target as Element;
          const attrName = mutation.attributeName;
          if (attrName && ['alt', 'title', 'placeholder', 'aria-label'].includes(attrName)) {
            shouldRescan = true;
          }
        }
      });
      
      if (shouldRescan) {
        // Debounce rescanning
        setTimeout(() => this.detectAllContent({ watchChanges: false }), 500);
      }
    });
    
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['alt', 'title', 'placeholder', 'aria-label', 'aria-description'],
    });
    
    this.observerActive = true;
  }

  /**
   * Setup intersection observer for visibility tracking
   */
  private setupIntersectionObserver(): void {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Update visibility status for tracked content
        this.contentMap.forEach((content) => {
          if (content.element === entry.target) {
            content.isVisible = entry.isIntersecting;
          }
        });
      });
    });
  }

  /**
   * Cleanup observers
   */
  public cleanup(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.observerActive = false;
    }
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    this.contentMap.clear();
  }

  /**
   * Get content by ID
   */
  public getContent(id: string): DetectedContent | undefined {
    return this.contentMap.get(id);
  }

  /**
   * Get all detected content
   */
  public getAllContent(): DetectedContent[] {
    return Array.from(this.contentMap.values());
  }

  /**
   * Filter content by criteria
   */
  public filterContent(criteria: {
    type?: ContentType[];
    visible?: boolean;
    minPriority?: number;
    domain?: string[];
  }): DetectedContent[] {
    return this.getAllContent().filter(content => {
      if (criteria.type && !criteria.type.includes(content.contentType)) return false;
      if (criteria.visible !== undefined && content.isVisible !== criteria.visible) return false;
      if (criteria.minPriority && content.priority < criteria.minPriority) return false;
      if (criteria.domain && !criteria.domain.includes(content.metadata.domain)) return false;
      return true;
    });
  }
}

// Singleton instance
export const contentDetector = new ContentDetector();