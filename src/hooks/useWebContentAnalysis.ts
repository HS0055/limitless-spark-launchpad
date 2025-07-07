import { useState, useCallback } from 'react';

interface ParsedComponent {
  id: string;
  tagName: string;
  textContent: string;
  attributes: Record<string, string>;
  children: ParsedComponent[];
  depth: number;
}

export const useWebContentAnalysis = () => {
  const [parsedComponents, setParsedComponents] = useState<ParsedComponent[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateId = (): string => {
    return `element-${Math.random().toString(36).substr(2, 9)}`;
  };

  const getElementAttributes = (element: Element): Record<string, string> => {
    const attributes: Record<string, string> = {};
    
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }
    
    return attributes;
  };

  const getDirectTextContent = (element: Element): string => {
    let textContent = '';
    
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim() || '';
        if (text) {
          textContent += text + ' ';
        }
      }
    }
    
    return textContent.trim();
  };

  const parseElement = (element: Element, depth: number = 0): ParsedComponent => {
    const id = generateId();
    const tagName = element.tagName.toLowerCase();
    const attributes = getElementAttributes(element);
    const textContent = getDirectTextContent(element);
    
    // Parse child elements (only direct children, not text nodes)
    const children: ParsedComponent[] = [];
    const childElements = Array.from(element.children);
    
    childElements.forEach(child => {
      // Only include significant elements or elements with content
      const childTextContent = getDirectTextContent(child);
      const hasSignificantContent = childTextContent.length > 0 || 
                                   child.children.length > 0 ||
                                   ['img', 'input', 'textarea', 'select', 'button', 'a'].includes(child.tagName.toLowerCase());
      
      if (hasSignificantContent) {
        children.push(parseElement(child, depth + 1));
      }
    });

    return {
      id,
      tagName,
      textContent,
      attributes,
      children,
      depth
    };
  };

  const analyzeHTML = useCallback(async (htmlContent: string): Promise<void> => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Create a temporary DOM to parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Remove script and style elements for security and clarity
      const scriptsAndStyles = doc.querySelectorAll('script, style');
      scriptsAndStyles.forEach(element => element.remove());
      
      // Find all meaningful elements, starting with body content or all elements if no body
      const bodyElement = doc.body;
      const rootElements = bodyElement ? Array.from(bodyElement.children) : Array.from(doc.documentElement.children);
      
      if (rootElements.length === 0) {
        throw new Error('No meaningful HTML elements found');
      }
      
      // Parse each root element
      const components: ParsedComponent[] = [];
      
      rootElements.forEach(element => {
        // Skip empty elements without content or children
        const hasContent = getDirectTextContent(element).length > 0 || 
                          element.children.length > 0 ||
                          ['img', 'input', 'textarea', 'select', 'button', 'a', 'div', 'section', 'article', 'header', 'footer', 'nav'].includes(element.tagName.toLowerCase());
        
        if (hasContent) {
          components.push(parseElement(element, 0));
        }
      });
      
      if (components.length === 0) {
        throw new Error('No meaningful content found in HTML');
      }
      
      setParsedComponents(components);
      
      console.log('Parsed components:', components);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze HTML content';
      setError(errorMessage);
      console.error('HTML analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const findComponentById = useCallback((id: string): ParsedComponent | null => {
    const findInComponents = (components: ParsedComponent[]): ParsedComponent | null => {
      for (const component of components) {
        if (component.id === id) {
          return component;
        }
        const found = findInComponents(component.children);
        if (found) {
          return found;
        }
      }
      return null;
    };
    
    return findInComponents(parsedComponents);
  }, [parsedComponents]);

  const updateComponent = useCallback((id: string, updates: Partial<ParsedComponent>): void => {
    const updateInComponents = (components: ParsedComponent[]): ParsedComponent[] => {
      return components.map(component => {
        if (component.id === id) {
          return { ...component, ...updates };
        }
        return {
          ...component,
          children: updateInComponents(component.children)
        };
      });
    };
    
    setParsedComponents(prev => updateInComponents(prev));
  }, []);

  const getComponentStats = useCallback(() => {
    const countComponents = (components: ParsedComponent[]): number => {
      return components.reduce((count, component) => {
        return count + 1 + countComponents(component.children);
      }, 0);
    };

    const getTotalTextLength = (components: ParsedComponent[]): number => {
      return components.reduce((length, component) => {
        return length + component.textContent.length + getTotalTextLength(component.children);
      }, 0);
    };

    return {
      totalComponents: countComponents(parsedComponents),
      totalTextLength: getTotalTextLength(parsedComponents),
      rootComponents: parsedComponents.length
    };
  }, [parsedComponents]);

  return {
    parsedComponents,
    isAnalyzing,
    error,
    analyzeHTML,
    findComponentById,
    updateComponent,
    getComponentStats
  };
};