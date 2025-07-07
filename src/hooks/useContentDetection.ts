import { useState, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContentAnalysis {
  type: 'heading' | 'paragraph' | 'button' | 'navigation' | 'form' | 'general';
  importance: 'high' | 'medium' | 'low';
  context: string;
  translationType: 'marketing' | 'technical' | 'cultural' | 'standard';
}

interface DetectedContent {
  element: Element;
  text: string;
  analysis: ContentAnalysis;
  originalText: string;
}

export const useContentDetection = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedContent, setDetectedContent] = useState<DetectedContent[]>([]);
  const { language } = useLanguage();
  const analysisCache = useRef<Map<string, ContentAnalysis>>(new Map());

  const analyzeElement = useCallback((element: Element): ContentAnalysis => {
    const tagName = element.tagName.toLowerCase();
    const className = element.className || '';
    const text = element.textContent?.trim() || '';
    
    // Cache key for analysis
    const cacheKey = `${tagName}-${className}-${text.substring(0, 50)}`;
    if (analysisCache.current.has(cacheKey)) {
      return analysisCache.current.get(cacheKey)!;
    }

    let analysis: ContentAnalysis = {
      type: 'general',
      importance: 'medium',
      context: 'general content',
      translationType: 'standard'
    };

    // Advanced element type detection
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      analysis.type = 'heading';
      analysis.importance = tagName === 'h1' ? 'high' : tagName === 'h2' ? 'high' : 'medium';
      analysis.translationType = 'marketing';
      analysis.context = `${tagName} heading element`;
    } else if (tagName === 'button' || className.includes('btn')) {
      analysis.type = 'button';
      analysis.importance = 'high';
      analysis.translationType = 'marketing';
      analysis.context = 'interactive button element';
    } else if (tagName === 'nav' || className.includes('nav') || className.includes('menu')) {
      analysis.type = 'navigation';
      analysis.importance = 'high';
      analysis.translationType = 'standard';
      analysis.context = 'navigation menu';
    } else if (tagName === 'p' && text.length > 100) {
      analysis.type = 'paragraph';
      analysis.importance = 'medium';
      analysis.translationType = 'cultural';
      analysis.context = 'descriptive paragraph';
    } else if (['label', 'input', 'textarea', 'select'].includes(tagName)) {
      analysis.type = 'form';
      analysis.importance = 'medium';
      analysis.translationType = 'standard';
      analysis.context = 'form element';
    }

    // Context-based adjustments
    if (className.includes('hero')) {
      analysis.importance = 'high';
      analysis.translationType = 'marketing';
      analysis.context += ', hero section';
    } else if (className.includes('cta')) {
      analysis.importance = 'high';
      analysis.translationType = 'marketing';
      analysis.context += ', call-to-action';
    } else if (className.includes('footer')) {
      analysis.importance = 'low';
      analysis.context += ', footer area';
    }

    // Detect technical content
    if (text.includes('API') || text.includes('SDK') || text.includes('JSON')) {
      analysis.translationType = 'technical';
    }

    // Cultural adaptation indicators
    if (text.includes('culture') || text.includes('tradition') || text.includes('community')) {
      analysis.translationType = 'cultural';
    }

    // Cache the analysis
    analysisCache.current.set(cacheKey, analysis);
    return analysis;
  }, []);

  const detectPageContent = useCallback(async (): Promise<DetectedContent[]> => {
    setIsAnalyzing(true);
    const contentElements: DetectedContent[] = [];

    try {
      // Enhanced content detection using TreeWalker
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode: (node) => {
            const element = node as Element;
            const text = element.textContent?.trim();
            
            // Skip empty, hidden, or technical elements
            if (!text || text.length < 2) return NodeFilter.FILTER_REJECT;
            if (element.hasAttribute('data-no-translate')) return NodeFilter.FILTER_REJECT;
            
            const tagName = element.tagName.toLowerCase();
            const skipTags = ['script', 'style', 'noscript', 'meta', 'link'];
            if (skipTags.includes(tagName)) return NodeFilter.FILTER_REJECT;

            // Only accept elements with meaningful text content
            const meaningfulTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'button', 'a', 'span', 'div', 'label'];
            if (meaningfulTags.includes(tagName) || element.children.length === 0) {
              return NodeFilter.FILTER_ACCEPT;
            }

            return NodeFilter.FILTER_SKIP;
          }
        }
      );

      let node;
      while (node = walker.nextNode()) {
        const element = node as Element;
        const text = element.textContent?.trim() || '';
        
        if (text.length > 1 && !element.querySelector('*')) { // Leaf elements only
          const analysis = analyzeElement(element);
          
          contentElements.push({
            element,
            text,
            analysis,
            originalText: text
          });
        }
      }

      // Sort by importance and type
      const sortedContent = contentElements.sort((a, b) => {
        const importanceOrder = { high: 3, medium: 2, low: 1 };
        return importanceOrder[b.analysis.importance] - importanceOrder[a.analysis.importance];
      });

      setDetectedContent(sortedContent);
      return sortedContent;
    } catch (error) {
      console.error('Content detection error:', error);
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  }, [analyzeElement]);

  const translateContent = useCallback(async (content: DetectedContent[], targetLang: string) => {
    if (targetLang === 'en') return; // No need to translate to English

    const batchSize = 5;
    for (let i = 0; i < content.length; i += batchSize) {
      const batch = content.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async (item) => {
          try {
            const result = await apiClient.invoke('intelligent-translate', {
              body: {
                content: item.text,
                sourceLang: 'en',
                targetLang: targetLang,
                context: item.analysis.context,
                translationType: item.analysis.translationType
              }
            });

            if (result.data?.translatedText && item.element) {
              // Apply translation to element
              if (item.element.textContent === item.originalText) {
                item.element.textContent = result.data.translatedText;
              }
            }
          } catch (error) {
            console.error('Translation error for:', item.text, error);
          }
        })
      );

      // Small delay between batches
      if (i + batchSize < content.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }, []);

  const clearCache = useCallback(() => {
    analysisCache.current.clear();
  }, []);

  return {
    isAnalyzing,
    detectedContent,
    detectPageContent,
    translateContent,
    clearCache
  };
};