import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Edit, Save, X, RefreshCw, Eye, EyeOff, 
  Brain, Target, Layers, Type, Image, Link
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface DetectedContent {
  id: string;
  element: Element;
  text: string;
  context: string;
  category: 'heading' | 'paragraph' | 'button' | 'link' | 'form' | 'navigation' | 'other';
  priority: number;
  uiPattern: string;
  translations: Record<string, string>;
  isEditing: boolean;
  suggestions: string[];
}

interface UIPattern {
  name: string;
  elements: DetectedContent[];
  category: 'navigation' | 'hero' | 'features' | 'testimonials' | 'footer' | 'form' | 'other';
}

export const TranslationManagementDashboard = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [isVisible, setIsVisible] = useState(false);
  const [detectedContent, setDetectedContent] = useState<DetectedContent[]>([]);
  const [uiPatterns, setUIPatterns] = useState<UIPattern[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [editingContent, setEditingContent] = useState<Record<string, string>>({});
  
  const observer = useRef<MutationObserver | null>(null);
  const highlightedElements = useRef<Set<Element>>(new Set());

  // Advanced content detection with UI/UX pattern recognition
  const detectContentAndPatterns = useCallback(async (): Promise<DetectedContent[]> => {
    const content: DetectedContent[] = [];
    const processedElements = new Set<Element>();

    // Enhanced selectors for comprehensive content detection
    const contentSelectors = [
      // Text content with semantic meaning
      'h1, h2, h3, h4, h5, h6', 'p', 'span:not(:empty)', 'div:not(:empty)',
      'a[href]', 'strong', 'em', 'small', 'blockquote', 'figcaption',
      // Interactive elements
      'button', '[role="button"]', 'input[type="submit"]', 'input[type="button"]',
      // Form elements
      'label', 'input[placeholder]', 'textarea[placeholder]', 'select option',
      // Navigation and structural
      'nav *', '[role="navigation"] *', '.nav-link', '.menu-item',
      // Content areas
      'main *', 'article *', 'section *', 'aside *', 'header *', 'footer *',
      // Custom attributes
      '[data-translate]', '.translatable', '[aria-label]', '[title]'
    ];

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          const element = node as Element;
          
          // Skip already processed elements
          if (processedElements.has(element)) return NodeFilter.FILTER_REJECT;
          
          // Skip script, style, and other non-translatable elements
          const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'SVG'];
          if (skipTags.includes(element.tagName)) return NodeFilter.FILTER_REJECT;
          
          // Skip hidden elements
          const style = window.getComputedStyle(element);
          if (style.display === 'none' || style.visibility === 'hidden') {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Check if element has translatable content
          const hasText = element.textContent?.trim().length > 0;
          const hasTranslatableAttrs = ['title', 'alt', 'placeholder', 'aria-label'].some(
            attr => element.getAttribute(attr)?.trim()
          );
          
          return (hasText || hasTranslatableAttrs) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
      }
    );

    let element: Element;
    while (element = walker.nextNode() as Element) {
      if (processedElements.has(element)) continue;
      
      const text = element.textContent?.trim();
      if (!text || text.length < 2) continue;
      
      // Analyze element context and UI patterns
      const context = analyzeElementContext(element);
      const category = categorizeElement(element);
      const uiPattern = identifyUIPattern(element);
      const priority = calculatePriority(element, context);
      
      // Get existing translations if any
      const translations = await getExistingTranslations(text);
      
      // Generate translation suggestions
      const suggestions = await generateTranslationSuggestions(text, context);
      
      const contentItem: DetectedContent = {
        id: generateElementId(element),
        element,
        text,
        context,
        category,
        priority,
        uiPattern,
        translations,
        isEditing: false,
        suggestions
      };
      
      content.push(contentItem);
      processedElements.add(element);
      
      // Add visual indicator for admin
      if (user && element.getAttribute('data-admin-highlight') !== 'true') {
        element.setAttribute('data-admin-highlight', 'true');
        (element as HTMLElement).style.outline = '1px dashed rgba(59, 130, 246, 0.5)';
        (element as HTMLElement).style.cursor = 'pointer';
        
        // Add click listener for direct editing
        element.addEventListener('click', (e) => {
          e.preventDefault();
          handleDirectEdit(contentItem);
        });
        
        highlightedElements.current.add(element);
      }
    }

    return content.sort((a, b) => b.priority - a.priority);
  }, [user]);

  // Analyze element context for better translation
  const analyzeElementContext = (element: Element): string => {
    const contexts = [];
    
    // Semantic analysis
    const tagName = element.tagName.toLowerCase();
    const semanticMap: Record<string, string> = {
      'h1': 'main page title', 'h2': 'section heading', 'h3': 'subsection title',
      'p': 'paragraph content', 'button': 'action button', 'a': 'navigation link',
      'nav': 'navigation menu', 'header': 'page header', 'footer': 'page footer',
      'main': 'main content area', 'aside': 'sidebar content', 'article': 'article text'
    };
    
    if (semanticMap[tagName]) contexts.push(semanticMap[tagName]);
    
    // CSS class analysis for UI patterns
    const className = element.className || '';
    const classPatterns = {
      'hero': 'hero section', 'cta': 'call to action', 'feature': 'feature description',
      'testimonial': 'testimonial content', 'price': 'pricing information',
      'nav': 'navigation', 'menu': 'menu item', 'card': 'card content',
      'banner': 'banner text', 'alert': 'alert message', 'modal': 'modal content'
    };
    
    Object.entries(classPatterns).forEach(([cls, context]) => {
      if (className.includes(cls)) contexts.push(context);
    });
    
    // Position-based context
    const rect = element.getBoundingClientRect();
    if (rect.top < 100) contexts.push('top section');
    if (rect.bottom > window.innerHeight - 100) contexts.push('bottom section');
    
    // Parent context analysis
    let parent = element.parentElement;
    let depth = 0;
    while (parent && parent !== document.body && depth < 3) {
      const parentClass = parent.className || '';
      const parentTag = parent.tagName.toLowerCase();
      
      if (parentTag === 'form') contexts.push('form element');
      if (parentClass.includes('testimonial')) contexts.push('testimonial section');
      if (parentClass.includes('pricing')) contexts.push('pricing section');
      
      parent = parent.parentElement;
      depth++;
    }
    
    return contexts.length > 0 ? contexts.join(', ') : 'general content';
  };

  // Categorize elements for better organization
  const categorizeElement = (element: Element): DetectedContent['category'] => {
    const tagName = element.tagName.toLowerCase();
    const className = element.className || '';
    
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) return 'heading';
    if (['button', 'input[type="submit"]'].includes(tagName) || element.getAttribute('role') === 'button') return 'button';
    if (tagName === 'a' || className.includes('link')) return 'link';
    if (tagName === 'p' || className.includes('text')) return 'paragraph';
    if (['label', 'input', 'textarea', 'select'].includes(tagName)) return 'form';
    if (className.includes('nav') || element.closest('nav')) return 'navigation';
    
    return 'other';
  };

  // Identify UI patterns for better context
  const identifyUIPattern = (element: Element): string => {
    const className = element.className || '';
    const parent = element.parentElement;
    const parentClass = parent?.className || '';
    
    // Hero section patterns
    if (className.includes('hero') || parentClass.includes('hero')) return 'Hero Section';
    
    // Navigation patterns
    if (element.closest('nav') || className.includes('nav')) return 'Navigation';
    
    // Card patterns
    if (className.includes('card') || parentClass.includes('card')) return 'Card Component';
    
    // Feature patterns
    if (className.includes('feature') || parentClass.includes('feature')) return 'Feature Section';
    
    // Testimonial patterns
    if (className.includes('testimonial') || parentClass.includes('testimonial')) return 'Testimonial';
    
    // CTA patterns
    if (className.includes('cta') || element.tagName === 'BUTTON') return 'Call to Action';
    
    // Footer patterns
    if (element.closest('footer') || className.includes('footer')) return 'Footer';
    
    return 'Content Block';
  };

  // Calculate priority for processing order
  const calculatePriority = (element: Element, context: string): number => {
    let priority = 50;
    
    // Tag-based priority
    const tagPriorities: Record<string, number> = {
      'h1': 100, 'h2': 90, 'h3': 80, 'button': 85, 'a': 75, 'p': 60
    };
    priority += tagPriorities[element.tagName.toLowerCase()] || 0;
    
    // Visibility priority
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight) priority += 30;
    if (rect.top < window.innerHeight / 2) priority += 20;
    
    // Context priority
    if (context.includes('hero')) priority += 40;
    if (context.includes('navigation')) priority += 35;
    if (context.includes('cta')) priority += 30;
    if (context.includes('heading')) priority += 25;
    
    return Math.max(0, Math.min(200, priority));
  };

  // Generate unique ID for elements
  const generateElementId = (element: Element): string => {
    const tagName = element.tagName.toLowerCase();
    const className = element.className.replace(/\s+/g, '-') || 'no-class';
    const text = element.textContent?.substring(0, 20).replace(/\s+/g, '-') || 'no-text';
    return `${tagName}-${className}-${text}-${Date.now()}`;
  };

  // Get existing translations from cache/database
  const getExistingTranslations = async (text: string): Promise<Record<string, string>> => {
    try {
      // This would typically fetch from a database or cache
      // For now, return empty object
      return {};
    } catch (error) {
      console.error('Error fetching existing translations:', error);
      return {};
    }
  };

  // Generate AI-powered translation suggestions
  const generateTranslationSuggestions = async (text: string, context: string): Promise<string[]> => {
    try {
      const result = await apiClient.invoke('ai-translate', {
        body: {
          text,
          sourceLang: 'en',
          targetLang: language === 'en' ? 'hy' : language,
          context,
          visionMode: true,
          generateSuggestions: true
        }
      });
      
      return result.data?.suggestions || [];
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  };

  // Handle direct element editing
  const handleDirectEdit = (content: DetectedContent) => {
    setEditingContent(prev => ({
      ...prev,
      [content.id]: content.text
    }));
    
    // Update the content state
    setDetectedContent(prev => 
      prev.map(item => 
        item.id === content.id ? { ...item, isEditing: true } : item
      )
    );
  };

  // Save edited content
  const saveEdit = async (contentId: string) => {
    const newText = editingContent[contentId];
    const content = detectedContent.find(item => item.id === contentId);
    
    if (!content || !newText) return;
    
    try {
      // Update the actual DOM element
      content.element.textContent = newText;
      
      // Update state
      setDetectedContent(prev => 
        prev.map(item => 
          item.id === contentId 
            ? { ...item, text: newText, isEditing: false }
            : item
        )
      );
      
      // Clear editing state
      setEditingContent(prev => {
        const updated = { ...prev };
        delete updated[contentId];
        return updated;
      });
      
      toast({
        title: "Content Updated",
        description: "The text has been successfully updated.",
      });
    } catch (error) {
      console.error('Error saving edit:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update the content. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Cancel editing
  const cancelEdit = (contentId: string) => {
    setDetectedContent(prev => 
      prev.map(item => 
        item.id === contentId ? { ...item, isEditing: false } : item
      )
    );
    
    setEditingContent(prev => {
      const updated = { ...prev };
      delete updated[contentId];
      return updated;
    });
  };

  // Scan website for content
  const scanWebsite = async () => {
    setIsScanning(true);
    try {
      const content = await detectContentAndPatterns();
      setDetectedContent(content);
      
      // Group content into UI patterns
      const patterns = groupIntoPatterns(content);
      setUIPatterns(patterns);
      
      toast({
        title: "Scan Complete",
        description: `Detected ${content.length} translatable elements across ${patterns.length} UI patterns.`,
      });
    } catch (error) {
      console.error('Error scanning website:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to scan the website. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Group content into UI patterns
  const groupIntoPatterns = (content: DetectedContent[]): UIPattern[] => {
    const patternGroups: Record<string, DetectedContent[]> = {};
    
    content.forEach(item => {
      const pattern = item.uiPattern;
      if (!patternGroups[pattern]) {
        patternGroups[pattern] = [];
      }
      patternGroups[pattern].push(item);
    });
    
    return Object.entries(patternGroups).map(([name, elements]) => ({
      name,
      elements,
      category: categorizePattern(name)
    }));
  };

  const categorizePattern = (patternName: string): UIPattern['category'] => {
    const name = patternName.toLowerCase();
    if (name.includes('nav')) return 'navigation';
    if (name.includes('hero')) return 'hero';
    if (name.includes('feature')) return 'features';
    if (name.includes('testimonial')) return 'testimonials';
    if (name.includes('footer')) return 'footer';
    if (name.includes('form')) return 'form';
    return 'other';
  };

  // Filter content based on search and category
  const filteredContent = detectedContent.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.context.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Show/hide dashboard with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cleanup highlights on unmount
  useEffect(() => {
    return () => {
      highlightedElements.current.forEach(element => {
        element.removeAttribute('data-admin-highlight');
        (element as HTMLElement).style.outline = '';
        (element as HTMLElement).style.cursor = '';
      });
    };
  }, []);

  // Only show for authenticated admin users
  if (!isVisible || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">AI Translation Management</h1>
              <p className="text-sm text-muted-foreground">
                Detect, edit, and translate website content with AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={scanWebsite} 
              disabled={isScanning}
              variant="outline"
            >
              {isScanning ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              {isScanning ? 'Scanning...' : 'Scan Website'}
            </Button>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-hidden">
          <Tabs defaultValue="content" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content ({detectedContent.length})</TabsTrigger>
              <TabsTrigger value="patterns">UI Patterns ({uiPatterns.length})</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="flex-1 mt-4 overflow-hidden">
              <div className="h-full flex flex-col">
                {/* Filters */}
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="all">All Categories</option>
                    <option value="heading">Headings</option>
                    <option value="paragraph">Paragraphs</option>
                    <option value="button">Buttons</option>
                    <option value="link">Links</option>
                    <option value="form">Forms</option>
                    <option value="navigation">Navigation</option>
                  </select>
                </div>

                {/* Content List */}
                <div className="flex-1 overflow-y-auto space-y-2">
                  {filteredContent.map((item) => (
                    <Card key={item.id} className="hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {item.uiPattern}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Priority: {item.priority}
                              </span>
                            </div>
                            
                            {item.isEditing ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editingContent[item.id] || item.text}
                                  onChange={(e) => setEditingContent(prev => ({
                                    ...prev,
                                    [item.id]: e.target.value
                                  }))}
                                  className="min-h-[60px]"
                                />
                                <div className="flex gap-2">
                                  <Button 
                                    onClick={() => saveEdit(item.id)}
                                    size="sm"
                                    className="h-8"
                                  >
                                    <Save className="w-3 h-3 mr-1" />
                                    Save
                                  </Button>
                                  <Button 
                                    onClick={() => cancelEdit(item.id)}
                                    variant="ghost"
                                    size="sm" 
                                    className="h-8"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <p className="font-medium text-sm mb-1 line-clamp-2">
                                  {item.text}
                                </p>
                                <p className="text-xs text-muted-foreground mb-2">
                                  Context: {item.context}
                                </p>
                                {item.suggestions.length > 0 && (
                                  <div className="text-xs">
                                    <span className="text-muted-foreground">Suggestions: </span>
                                    {item.suggestions.slice(0, 2).map((suggestion, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs mr-1">
                                        {suggestion}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              onClick={() => handleDirectEdit(item)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => item.element.scrollIntoView({ behavior: 'smooth' })}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Target className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="patterns" className="flex-1 mt-4 overflow-y-auto">
              <div className="space-y-4">
                {uiPatterns.map((pattern, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Layers className="w-5 h-5" />
                          {pattern.name}
                        </CardTitle>
                        <Badge variant="outline">
                          {pattern.elements.length} elements
                        </Badge>
                      </div>
                      <CardDescription>
                        Category: {pattern.category}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        {pattern.elements.slice(0, 3).map((element) => (
                          <div key={element.id} className="text-sm p-2 bg-accent/30 rounded">
                            <div className="font-medium">{element.text.substring(0, 100)}...</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {element.context}
                            </div>
                          </div>
                        ))}
                        {pattern.elements.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center py-2">
                            +{pattern.elements.length - 3} more elements
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="flex-1 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Type className="w-5 h-5" />
                      Content Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Elements:</span>
                        <Badge>{detectedContent.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>UI Patterns:</span>
                        <Badge>{uiPatterns.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Headings:</span>
                        <Badge>{detectedContent.filter(c => c.category === 'heading').length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Interactive:</span>
                        <Badge>{detectedContent.filter(c => ['button', 'link'].includes(c.category)).length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 text-center text-sm text-muted-foreground">
          Press Ctrl+Shift+A to toggle • Click elements directly to edit • AI-powered content detection
        </div>
      </div>
    </div>
  );
};

export default TranslationManagementDashboard;