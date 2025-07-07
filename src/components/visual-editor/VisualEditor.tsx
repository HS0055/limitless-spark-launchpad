import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Edit3, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  MousePointer, 
  Type, 
  Palette,
  Layout,
  Move,
  RotateCcw,
  Zap,
  Settings,
  Layers,
  Image,
  Square
} from 'lucide-react';

interface EditableElement {
  id: string;
  element: HTMLElement;
  originalStyles: Record<string, string>;
  originalText: string;
  selector: string;
  elementType: string;
  bounds: DOMRect;
}

interface ElementEdit {
  id: string;
  selector: string;
  page_path: string;
  element_type: string;
  original_text: string;
  edited_text: string;
  styles: Record<string, string>;
  is_active: boolean;
}

export const VisualEditor = () => {
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [selectedElement, setSelectedElement] = useState<EditableElement | null>(null);
  const [editableElements, setEditableElements] = useState<EditableElement[]>([]);
  const [elementEdits, setElementEdits] = useState<ElementEdit[]>([]);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const selectionBoxRef = useRef<HTMLDivElement>(null);

  // Initialize editor
  useEffect(() => {
    if (isEditorActive) {
      initializeEditor();
      loadElementEdits();
    } else {
      cleanupEditor();
    }
    
    return () => cleanupEditor();
  }, [isEditorActive]);

  // Apply saved edits
  useEffect(() => {
    applyElementEdits();
  }, [elementEdits]);

  const initializeEditor = useCallback(() => {
    document.body.style.position = 'relative';
    document.body.style.overflow = 'hidden';
    
    // Add event listeners
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleElementClick);
    document.addEventListener('keydown', handleKeyDown);
    
    // Scan for editable elements
    scanEditableElements();
    
    toast({
      title: "🎨 Visual Editor Activated",
      description: "Click on any element to start editing. Press ESC to exit.",
    });
  }, []);

  const cleanupEditor = useCallback(() => {
    document.body.style.position = '';
    document.body.style.overflow = '';
    
    // Remove event listeners
    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('mouseout', handleMouseOut);
    document.removeEventListener('click', handleElementClick);
    document.removeEventListener('keydown', handleKeyDown);
    
    // Clear selections
    setSelectedElement(null);
    setHoveredElement(null);
    
    // Remove highlights
    document.querySelectorAll('.visual-editor-highlight, .visual-editor-selected').forEach(el => {
      el.classList.remove('visual-editor-highlight', 'visual-editor-selected');
    });
  }, []);

  const scanEditableElements = useCallback(() => {
    const elements: EditableElement[] = [];
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      
      if (isEditableElement(htmlElement)) {
        const bounds = htmlElement.getBoundingClientRect();
        const selector = generateUniqueSelector(htmlElement);
        
        elements.push({
          id: `element-${index}`,
          element: htmlElement,
          originalStyles: getElementStyles(htmlElement),
          originalText: htmlElement.textContent || '',
          selector,
          elementType: getElementType(htmlElement),
          bounds
        });
      }
    });
    
    setEditableElements(elements);
  }, []);

  const isEditableElement = (element: HTMLElement): boolean => {
    const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'HEAD', 'META', 'LINK'];
    const skipClasses = ['visual-editor-panel', 'visual-editor-highlight', 'visual-editor-selected'];
    const skipIds = ['visual-editor-overlay', 'visual-editor-selection-box'];
    
    return (
      !skipTags.includes(element.tagName) &&
      !skipClasses.some(cls => element.classList.contains(cls)) &&
      !skipIds.some(id => element.id === id) &&
      !element.closest('.visual-editor-panel') &&
      (element.textContent?.trim().length > 0 || 
       element.children.length > 0 || 
       ['IMG', 'VIDEO', 'CANVAS', 'SVG'].includes(element.tagName))
    );
  };

  const generateUniqueSelector = (element: HTMLElement): string => {
    const parts: string[] = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += `#${current.id}`;
        parts.unshift(selector);
        break;
      }
      
      if (current.className) {
        const classes = current.className.split(' ').filter(c => c.trim());
        if (classes.length > 0) {
          selector += '.' + classes.join('.');
        }
      }
      
      // Add nth-child for uniqueness
      const siblings = Array.from(current.parentNode?.children || []);
      const index = siblings.indexOf(current);
      if (siblings.length > 1) {
        selector += `:nth-child(${index + 1})`;
      }
      
      parts.unshift(selector);
      current = current.parentElement!;
    }
    
    return parts.join(' > ');
  };

  const getElementStyles = (element: HTMLElement): Record<string, string> => {
    const computedStyles = window.getComputedStyle(element);
    const styles: Record<string, string> = {};
    
    // Key style properties to track
    const properties = [
      'color', 'backgroundColor', 'fontSize', 'fontFamily', 'fontWeight',
      'textAlign', 'padding', 'margin', 'border', 'borderRadius',
      'width', 'height', 'display', 'position', 'opacity', 'transform'
    ];
    
    properties.forEach(prop => {
      styles[prop] = computedStyles.getPropertyValue(prop);
    });
    
    return styles;
  };

  const getElementType = (element: HTMLElement): string => {
    const tagMap: Record<string, string> = {
      'H1': 'heading', 'H2': 'heading', 'H3': 'heading', 'H4': 'heading', 'H5': 'heading', 'H6': 'heading',
      'P': 'paragraph', 'SPAN': 'text', 'DIV': 'container', 'SECTION': 'section',
      'BUTTON': 'button', 'A': 'link', 'IMG': 'image', 'VIDEO': 'video',
      'UL': 'list', 'OL': 'list', 'LI': 'list-item'
    };
    
    return tagMap[element.tagName] || 'element';
  };

  const handleMouseOver = (e: MouseEvent) => {
    if (!isEditorActive) return;
    
    const element = e.target as HTMLElement;
    if (isEditableElement(element) && element !== selectedElement?.element) {
      setHoveredElement(element);
      element.classList.add('visual-editor-highlight');
      updateSelectionBox(element);
    }
  };

  const handleMouseOut = (e: MouseEvent) => {
    if (!isEditorActive) return;
    
    const element = e.target as HTMLElement;
    element.classList.remove('visual-editor-highlight');
    setHoveredElement(null);
  };

  const handleElementClick = (e: MouseEvent) => {
    if (!isEditorActive) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const element = e.target as HTMLElement;
    if (isEditableElement(element)) {
      selectElement(element);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (selectedElement) {
        setSelectedElement(null);
      } else {
        setIsEditorActive(false);
      }
    }
  };

  const selectElement = (element: HTMLElement) => {
    // Clear previous selection
    document.querySelectorAll('.visual-editor-selected').forEach(el => {
      el.classList.remove('visual-editor-selected');
    });
    
    const editableElement = editableElements.find(e => e.element === element);
    if (editableElement) {
      setSelectedElement(editableElement);
      setEditText(editableElement.originalText);
      element.classList.add('visual-editor-selected');
      updateSelectionBox(element);
      
      toast({
        title: "Element Selected",
        description: `Selected ${editableElement.elementType}: ${editableElement.originalText.substring(0, 30)}...`,
      });
    }
  };

  const updateSelectionBox = (element: HTMLElement) => {
    if (!selectionBoxRef.current) return;
    
    const bounds = element.getBoundingClientRect();
    const selectionBox = selectionBoxRef.current;
    
    selectionBox.style.left = `${bounds.left + window.scrollX}px`;
    selectionBox.style.top = `${bounds.top + window.scrollY}px`;
    selectionBox.style.width = `${bounds.width}px`;
    selectionBox.style.height = `${bounds.height}px`;
    selectionBox.style.display = 'block';
  };

  const loadElementEdits = async () => {
    try {
      const { data, error } = await supabase
        .from('website_texts')
        .select('*')
        .eq('page_path', window.location.pathname)
        .eq('is_active', true);

      if (error) throw error;
      
      const edits: ElementEdit[] = (data || []).map(item => ({
        id: item.id,
        selector: item.selector,
        page_path: item.page_path,
        element_type: item.element_type || 'text',
        original_text: item.original_text,
        edited_text: item.edited_text,
        styles: typeof item.styles === 'object' ? item.styles : {},
        is_active: item.is_active || false
      }));
      
      setElementEdits(edits);
    } catch (error) {
      console.error('Failed to load element edits:', error);
    }
  };

  const applyElementEdits = () => {
    elementEdits.forEach(edit => {
      try {
        const elements = document.querySelectorAll(edit.selector);
        elements.forEach(element => {
          const htmlElement = element as HTMLElement;
          
          // Apply text changes
          if (edit.edited_text && htmlElement.textContent?.trim() === edit.original_text.trim()) {
            htmlElement.textContent = edit.edited_text;
          }
          
          // Apply style changes
          Object.entries(edit.styles).forEach(([property, value]) => {
            if (value) {
              htmlElement.style.setProperty(property, value);
            }
          });
          
          htmlElement.setAttribute('data-edited', 'true');
          htmlElement.setAttribute('data-edit-id', edit.id);
        });
      } catch (error) {
        console.error('Failed to apply edit:', error);
      }
    });
  };

  const saveElementEdit = async () => {
    if (!selectedElement) return;
    
    setLoading(true);
    try {
      const editData = {
        selector: selectedElement.selector,
        original_text: selectedElement.originalText,
        edited_text: editText.trim(),
        page_path: window.location.pathname,
        element_type: selectedElement.elementType,
        is_active: true
      };

      const { error } = await supabase
        .from('website_texts')
        .upsert(editData, {
          onConflict: 'selector,page_path'
        });

      if (error) throw error;
      
      // Apply the edit immediately
      selectedElement.element.textContent = editText.trim();
      selectedElement.element.setAttribute('data-edited', 'true');
      
      toast({
        title: "✅ Element Updated",
        description: "Changes saved successfully!",
      });
      
      // Reload edits
      loadElementEdits();
      
    } catch (error) {
      console.error('Failed to save element edit:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateElementStyle = (property: string, value: string) => {
    if (!selectedElement) return;
    
    selectedElement.element.style.setProperty(property, value);
  };

  return (
    <>
      {/* Editor Styles */}
      <style>{`
        .visual-editor-highlight {
          outline: 2px dashed #3b82f6 !important;
          outline-offset: 2px !important;
          cursor: pointer !important;
        }
        
        .visual-editor-selected {
          outline: 3px solid #10b981 !important;
          outline-offset: 2px !important;
          background-color: rgba(16, 185, 129, 0.1) !important;
        }
        
        .visual-editor-overlay {
          pointer-events: none !important;
        }
        
        .visual-editor-panel {
          pointer-events: auto !important;
        }
        
        [data-edited="true"] {
          position: relative;
        }
        
        [data-edited="true"]::after {
          content: "✏️";
          position: absolute;
          top: -8px;
          right: -8px;
          font-size: 12px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
      `}</style>

      {/* Selection Box */}
      <div
        ref={selectionBoxRef}
        id="visual-editor-selection-box"
        className="fixed pointer-events-none z-[9998] border-2 border-primary bg-primary/10 hidden"
        style={{ borderStyle: 'dashed' }}
      />

      {/* Main Editor Panel */}
      <div
        id="visual-editor-overlay"
        className={`fixed inset-0 z-[9999] visual-editor-overlay ${isEditorActive ? 'block' : 'hidden'}`}
      >
        {/* Control Panel */}
        <Card className="fixed top-4 right-4 w-80 max-h-[90vh] shadow-2xl visual-editor-panel">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Visual Editor
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditorActive(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={isEditorActive}
                onCheckedChange={setIsEditorActive}
              />
              <span className="text-sm">
                {isEditorActive ? 'Active' : 'Inactive'}
              </span>
              {isEditorActive && <Zap className="w-4 h-4 text-primary animate-pulse" />}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
            {selectedElement ? (
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Element Type</label>
                    <Badge variant="outline">{selectedElement.elementType}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Text Content</label>
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      placeholder="Enter text content..."
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <Button
                    onClick={saveElementEdit}
                    disabled={loading}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </TabsContent>
                
                <TabsContent value="style" className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Text Color</label>
                    <Input
                      type="color"
                      onChange={(e) => updateElementStyle('color', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Background Color</label>
                    <Input
                      type="color"
                      onChange={(e) => updateElementStyle('background-color', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Font Size</label>
                    <Select onValueChange={(value) => updateElementStyle('font-size', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12px">12px</SelectItem>
                        <SelectItem value="14px">14px</SelectItem>
                        <SelectItem value="16px">16px</SelectItem>
                        <SelectItem value="18px">18px</SelectItem>
                        <SelectItem value="20px">20px</SelectItem>
                        <SelectItem value="24px">24px</SelectItem>
                        <SelectItem value="32px">32px</SelectItem>
                        <SelectItem value="48px">48px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Font Weight</label>
                    <Select onValueChange={(value) => updateElementStyle('font-weight', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select weight" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">Light</SelectItem>
                        <SelectItem value="400">Normal</SelectItem>
                        <SelectItem value="500">Medium</SelectItem>
                        <SelectItem value="600">Semi Bold</SelectItem>
                        <SelectItem value="700">Bold</SelectItem>
                        <SelectItem value="800">Extra Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <TabsContent value="layout" className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Padding</label>
                    <Input
                      placeholder="e.g., 10px or 1rem"
                      onChange={(e) => updateElementStyle('padding', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Margin</label>
                    <Input
                      placeholder="e.g., 10px or 1rem"
                      onChange={(e) => updateElementStyle('margin', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Border Radius</label>
                    <Input
                      placeholder="e.g., 8px"
                      onChange={(e) => updateElementStyle('border-radius', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Opacity</label>
                    <Slider
                      defaultValue={[100]}
                      max={100}
                      step={1}
                      onValueChange={(value) => updateElementStyle('opacity', (value[0] / 100).toString())}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8">
                <MousePointer className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select an Element</h3>
                <p className="text-muted-foreground mb-4">
                  Click on any element on the page to start editing
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Click to select elements</p>
                  <p>• Edit text, styles, and layout</p>
                  <p>• Press ESC to deselect</p>
                  <p>• Changes are saved automatically</p>
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Elements: {editableElements.length}</span>
                <span>Edits: {elementEdits.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Toggle Button */}
      {!isEditorActive && (
        <Button
          onClick={() => setIsEditorActive(true)}
          className="fixed bottom-4 right-4 z-[9999] rounded-full w-14 h-14 shadow-lg"
          size="lg"
        >
          <Edit3 className="w-6 h-6" />
        </Button>
      )}
    </>
  );
};