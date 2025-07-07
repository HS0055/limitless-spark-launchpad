import { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface TranslationBug {
  id: string;
  type: 'missing_icon' | 'broken_layout' | 'untranslated_text' | 'invalid_translation';
  element: string;
  originalContent: string;
  translatedContent?: string;
  timestamp: number;
  resolved: boolean;
}

interface SystemMetrics {
  totalTranslations: number;
  successRate: number;
  bugsDetected: number;
  bugsFixed: number;
  elementsDetected: number;
  iconsRestored: number;
  averageTranslationTime: number;
}

interface ElementSnapshot {
  element: Element;
  originalHTML: string;
  originalText: string;
  hasIcon: boolean;
  iconClass?: string;
  iconSrc?: string;
  computedStyles: Record<string, string>;
}

export const IntelligentTranslationSystem = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isActive, setIsActive] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalTranslations: 0,
    successRate: 100,
    bugsDetected: 0,
    bugsFixed: 0,
    elementsDetected: 0,
    iconsRestored: 0,
    averageTranslationTime: 0
  });
  
  const detectedBugs = useRef<TranslationBug[]>([]);
  const elementSnapshots = useRef<Map<Element, ElementSnapshot>>(new Map());
  const translationCache = useRef<Map<string, string>>(new Map());
  const bugDetectionTimer = useRef<NodeJS.Timeout>();
  const isProcessing = useRef(false);

  // Enhanced element detection with complete website scanning
  const detectAllWebsiteElements = useCallback((): Element[] => {
    const elements: Element[] = [];
    const processedElements = new Set<Element>();

    // Comprehensive selectors for complete website detection
    const selectors = [
      // Text content
      'h1, h2, h3, h4, h5, h6', 'p', 'span', 'div', 'a', 'strong', 'em', 'small', 'li', 'td', 'th',
      // Interactive elements
      'button', 'input[type="button"]', 'input[type="submit"]', '[role="button"]',
      // Form elements
      'input[placeholder]', 'textarea[placeholder]', 'label', 'option',
      // Navigation
      'nav *', '.nav *', '[role="navigation"] *', 'header *', 'footer *',
      // Content areas
      'main *', 'article *', 'section *', 'aside *', '.content *',
      // Images and media
      'img[alt]', 'img[title]', '[aria-label]', '[title]',
      // Dynamic content
      '[data-translate]', '.translatable', '[translate="yes"]',
      // Icons (various implementations)
      'i[class*="icon"]', '[class*="icon-"]', 'svg', '.material-icons', '.fa', '.fas', '.far', '.fab'
    ];

    // Use comprehensive tree walker for complete detection
    const walker = document.createTreeWalker(
      document.documentElement,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          if (processedElements.has(node as Element)) {
            return NodeFilter.FILTER_REJECT;
          }

          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Skip technical elements
            if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK'].includes(element.tagName)) {
              return NodeFilter.FILTER_REJECT;
            }

            // Check if element matches our selectors or has translatable content
            const hasTranslatableContent = 
              element.textContent?.trim().length > 0 ||
              element.hasAttribute('title') ||
              element.hasAttribute('alt') ||
              element.hasAttribute('placeholder') ||
              element.hasAttribute('aria-label');

            if (hasTranslatableContent) {
              return NodeFilter.FILTER_ACCEPT;
            }
          }

          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (text && text.length > 0 && !/^[\d\s\.,\-\+\(\)\[\]\/\\]+$/.test(text)) {
              return NodeFilter.FILTER_ACCEPT;
            }
          }

          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (!processedElements.has(element)) {
          elements.push(element);
          processedElements.add(element);
          
          // Create detailed snapshot for bug detection
          createElementSnapshot(element);
        }
      } else if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
        const parent = node.parentElement;
        if (!processedElements.has(parent)) {
          elements.push(parent);
          processedElements.add(parent);
          createElementSnapshot(parent);
        }
      }
    }

    setMetrics(prev => ({ ...prev, elementsDetected: elements.length }));
    return elements;
  }, []);

  // Create detailed element snapshot for bug detection
  const createElementSnapshot = (element: Element): void => {
    if (elementSnapshots.current.has(element)) return;

    const computedStyles = window.getComputedStyle(element);
    const snapshot: ElementSnapshot = {
      element,
      originalHTML: element.outerHTML,
      originalText: element.textContent || '',
      hasIcon: detectIconInElement(element),
      computedStyles: {
        display: computedStyles.display,
        visibility: computedStyles.visibility,
        opacity: computedStyles.opacity,
        color: computedStyles.color,
        backgroundColor: computedStyles.backgroundColor,
        fontSize: computedStyles.fontSize,
        fontFamily: computedStyles.fontFamily
      }
    };

    // Detect icon details
    if (snapshot.hasIcon) {
      const iconImg = element.querySelector('img');
      const iconSvg = element.querySelector('svg');
      const iconI = element.querySelector('i[class*="icon"], .fa, .fas, .far, .fab, .material-icons');
      
      if (iconImg) {
        snapshot.iconSrc = iconImg.src;
      } else if (iconI) {
        snapshot.iconClass = iconI.className;
      }
    }

    elementSnapshots.current.set(element, snapshot);
  };

  // Detect if element contains or is an icon
  const detectIconInElement = (element: Element): boolean => {
    // Check if element itself is an icon
    if (element.tagName === 'SVG' || element.tagName === 'IMG') return true;
    if (element.classList.contains('icon') || element.className.includes('icon-')) return true;
    if (element.classList.contains('fa') || element.classList.contains('material-icons')) return true;

    // Check if element contains icons
    const hasIconChild = 
      element.querySelector('svg') ||
      element.querySelector('img') ||
      element.querySelector('i[class*="icon"], .fa, .fas, .far, .fab, .material-icons') ||
      element.querySelector('[class*="icon-"]');

    return !!hasIconChild;
  };

  // Intelligent bug detection system
  const detectTranslationBugs = useCallback(async (): Promise<void> => {
    const currentBugs: TranslationBug[] = [];

    elementSnapshots.current.forEach((snapshot, element) => {
      try {
        // Check for missing icons
        if (snapshot.hasIcon && !detectIconInElement(element)) {
          currentBugs.push({
            id: `missing_icon_${Date.now()}_${Math.random()}`,
            type: 'missing_icon',
            element: element.tagName.toLowerCase(),
            originalContent: snapshot.originalHTML,
            timestamp: Date.now(),
            resolved: false
          });
        }

        // Check for broken layout
        const currentStyles = window.getComputedStyle(element);
        if (currentStyles.display !== snapshot.computedStyles.display ||
            currentStyles.visibility !== snapshot.computedStyles.visibility ||
            parseFloat(currentStyles.opacity) < 0.1) {
          currentBugs.push({
            id: `broken_layout_${Date.now()}_${Math.random()}`,
            type: 'broken_layout',
            element: element.tagName.toLowerCase(),
            originalContent: snapshot.originalHTML,
            timestamp: Date.now(),
            resolved: false
          });
        }

        // Check for untranslated text (if not English)
        if (language !== 'en' && element.textContent === snapshot.originalText && 
            element.textContent && element.textContent.trim().length > 0 &&
            !element.hasAttribute('data-no-translate')) {
          currentBugs.push({
            id: `untranslated_text_${Date.now()}_${Math.random()}`,
            type: 'untranslated_text',
            element: element.tagName.toLowerCase(),
            originalContent: element.textContent,
            timestamp: Date.now(),
            resolved: false
          });
        }

        // Check for invalid translations (same text when should be different)
        const currentText = element.textContent || '';
        if (language !== 'en' && currentText === snapshot.originalText && 
            currentText.length > 3 && /^[a-zA-Z\s]+$/.test(currentText)) {
          currentBugs.push({
            id: `invalid_translation_${Date.now()}_${Math.random()}`,
            type: 'invalid_translation',
            element: element.tagName.toLowerCase(),
            originalContent: snapshot.originalText,
            translatedContent: currentText,
            timestamp: Date.now(),
            resolved: false
          });
        }
      } catch (error) {
        console.warn('Bug detection error for element:', element, error);
      }
    });

    // Update bugs and metrics
    const newBugs = currentBugs.filter(bug => 
      !detectedBugs.current.some(existing => 
        existing.type === bug.type && 
        existing.element === bug.element && 
        existing.originalContent === bug.originalContent
      )
    );

    detectedBugs.current.push(...newBugs);
    
    setMetrics(prev => ({
      ...prev,
      bugsDetected: detectedBugs.current.length
    }));

    // Auto-fix bugs
    if (newBugs.length > 0) {
      await autoFixBugs(newBugs);
    }
  }, [language]);

  // Auto-fix detected bugs
  const autoFixBugs = async (bugs: TranslationBug[]): Promise<void> => {
    let fixedCount = 0;

    for (const bug of bugs) {
      try {
        switch (bug.type) {
          case 'missing_icon':
            if (await restoreIcon(bug)) fixedCount++;
            break;
          case 'broken_layout':
            if (await fixLayout(bug)) fixedCount++;
            break;
          case 'untranslated_text':
            if (await translateElement(bug)) fixedCount++;
            break;
          case 'invalid_translation':
            if (await retranslateElement(bug)) fixedCount++;
            break;
        }
      } catch (error) {
        console.warn(`Failed to fix bug ${bug.id}:`, error);
      }
    }

    setMetrics(prev => ({
      ...prev,
      bugsFixed: prev.bugsFixed + fixedCount
    }));

    if (fixedCount > 0) {
      toast({
        title: "Auto-Fix Complete",
        description: `Fixed ${fixedCount} translation bugs automatically`,
      });
    }
  };

  // Restore missing icons
  const restoreIcon = async (bug: TranslationBug): Promise<boolean> => {
    try {
      const elements = document.querySelectorAll(bug.element);
      
      for (const element of elements) {
        const snapshot = elementSnapshots.current.get(element);
        if (!snapshot || !snapshot.hasIcon) continue;

        // Restore icon based on original snapshot
        if (snapshot.iconSrc) {
          const img = document.createElement('img');
          img.src = snapshot.iconSrc;
          img.alt = '';
          element.prepend(img);
        } else if (snapshot.iconClass) {
          const icon = document.createElement('i');
          icon.className = snapshot.iconClass;
          element.prepend(icon);
        }

        // Mark bug as resolved
        bug.resolved = true;
        
        setMetrics(prev => ({
          ...prev,
          iconsRestored: prev.iconsRestored + 1
        }));

        return true;
      }
    } catch (error) {
      console.warn('Icon restoration failed:', error);
    }
    return false;
  };

  // Fix broken layouts
  const fixLayout = async (bug: TranslationBug): Promise<boolean> => {
    try {
      const elements = document.querySelectorAll(bug.element);
      
      for (const element of elements) {
        const snapshot = elementSnapshots.current.get(element);
        if (!snapshot) continue;

        // Restore critical styles
        const htmlElement = element as HTMLElement;
        htmlElement.style.display = snapshot.computedStyles.display;
        htmlElement.style.visibility = snapshot.computedStyles.visibility;
        htmlElement.style.opacity = snapshot.computedStyles.opacity;

        bug.resolved = true;
        return true;
      }
    } catch (error) {
      console.warn('Layout fix failed:', error);
    }
    return false;
  };

  // Translate untranslated elements
  const translateElement = async (bug: TranslationBug): Promise<boolean> => {
    try {
      if (!bug.originalContent || language === 'en') return false;

      // Check cache first
      const cacheKey = `${bug.originalContent}_${language}`;
      let translation = translationCache.current.get(cacheKey);

      if (!translation) {
        // Get AI translation
        const result = await apiClient.invoke('ai-translate', {
          body: {
            text: bug.originalContent,
            sourceLang: 'en',
            targetLang: language,
            context: 'website content',
            visionMode: false
          }
        });

        if (result.data?.translatedText) {
          translation = result.data.translatedText;
          translationCache.current.set(cacheKey, translation);
        }
      }

      if (translation) {
        const elements = document.querySelectorAll(bug.element);
        for (const element of elements) {
          if (element.textContent === bug.originalContent) {
            element.textContent = translation;
            element.setAttribute('data-translated', 'true');
            bug.resolved = true;
            
            setMetrics(prev => ({
              ...prev,
              totalTranslations: prev.totalTranslations + 1
            }));
            
            return true;
          }
        }
      }
    } catch (error) {
      console.warn('Element translation failed:', error);
    }
    return false;
  };

  // Re-translate invalid translations
  const retranslateElement = async (bug: TranslationBug): Promise<boolean> => {
    // Force new translation by skipping cache
    translationCache.current.delete(`${bug.originalContent}_${language}`);
    return await translateElement(bug);
  };

  // Initialize intelligent system
  useEffect(() => {
    if (language === 'en') {
      setIsActive(false);
      return;
    }

    setIsActive(true);
    
    // Initial detection
    setTimeout(() => {
      detectAllWebsiteElements();
      detectTranslationBugs();
    }, 1000);

    // Continuous bug monitoring
    bugDetectionTimer.current = setInterval(() => {
      if (!isProcessing.current) {
        detectTranslationBugs();
      }
    }, 5000);

    return () => {
      if (bugDetectionTimer.current) {
        clearInterval(bugDetectionTimer.current);
      }
    };
  }, [language, detectAllWebsiteElements, detectTranslationBugs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (bugDetectionTimer.current) {
        clearInterval(bugDetectionTimer.current);
      }
      elementSnapshots.current.clear();
      translationCache.current.clear();
      detectedBugs.current = [];
    };
  }, []);

  // This system operates invisibly
  return null;
};

export default IntelligentTranslationSystem;