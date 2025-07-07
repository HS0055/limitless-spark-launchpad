import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Trash2,
  RefreshCw,
  Zap
} from 'lucide-react';

interface WebsiteText {
  id: string;
  selector: string;
  original_text: string;
  edited_text: string;
  page_path: string;
  element_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EditableElement {
  element: HTMLElement;
  originalText: string;
  selector: string;
  elementType: string;
}

export const DragDropTextEditor = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [websiteTexts, setWebsiteTexts] = useState<WebsiteText[]>([]);
  const [editingText, setEditingText] = useState<WebsiteText | null>(null);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [selectedElements, setSelectedElements] = useState<EditableElement[]>([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const editPanelRef = useRef<HTMLDivElement>(null);

  // Load existing website texts
  useEffect(() => {
    loadWebsiteTexts();
    setupRealtimeSubscription();
  }, []);

  // Apply text edits on page load
  useEffect(() => {
    applyTextEdits();
  }, [websiteTexts]);

  const loadWebsiteTexts = async () => {
    try {
      const { data, error } = await supabase
        .from('website_texts')
        .select('*')
        .eq('page_path', window.location.pathname)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setWebsiteTexts(data || []);
    } catch (error) {
      console.error('Failed to load website texts:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('website-texts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'website_texts'
        },
        (payload) => {
          console.log('Real-time website text update:', payload);
          loadWebsiteTexts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const applyTextEdits = () => {
    websiteTexts.forEach(textEdit => {
      try {
        const elements = document.querySelectorAll(textEdit.selector);
        elements.forEach(element => {
          if (element.textContent?.trim() === textEdit.original_text.trim()) {
            element.textContent = textEdit.edited_text;
            element.setAttribute('data-edited', 'true');
            element.setAttribute('data-edit-id', textEdit.id);
          }
        });
      } catch (error) {
        console.error('Failed to apply text edit:', error);
      }
    });
  };

  const enableEditMode = () => {
    setIsEditMode(true);
    document.body.style.cursor = 'crosshair';
    
    // Add event listeners for text selection
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleElementClick);
    
    toast({
      title: "✨ Edit Mode Enabled",
      description: "Click on any text element to edit it. Drag to select multiple elements.",
    });
  };

  const disableEditMode = () => {
    setIsEditMode(false);
    document.body.style.cursor = 'default';
    setHoveredElement(null);
    setSelectedElements([]);
    
    // Remove event listeners
    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('mouseout', handleMouseOut);
    document.removeEventListener('click', handleElementClick);
    
    // Remove all highlights
    document.querySelectorAll('.admin-text-highlight').forEach(el => {
      el.classList.remove('admin-text-highlight');
    });
    
    toast({
      title: "Edit Mode Disabled",
      description: "Text editing mode has been turned off.",
    });
  };

  const handleMouseOver = (e: MouseEvent) => {
    if (!isEditMode) return;
    
    const element = e.target as HTMLElement;
    if (isEditableElement(element)) {
      setHoveredElement(element);
      element.classList.add('admin-text-highlight');
    }
  };

  const handleMouseOut = (e: MouseEvent) => {
    if (!isEditMode) return;
    
    const element = e.target as HTMLElement;
    if (element.classList.contains('admin-text-highlight')) {
      element.classList.remove('admin-text-highlight');
    }
    setHoveredElement(null);
  };

  const handleElementClick = (e: MouseEvent) => {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const element = e.target as HTMLElement;
    if (isEditableElement(element)) {
      const selector = generateSelector(element);
      const editableElement: EditableElement = {
        element,
        originalText: element.textContent?.trim() || '',
        selector,
        elementType: getElementType(element)
      };
      
      setSelectedElements([editableElement]);
      setNewText(editableElement.originalText);
      
      // Highlight selected element
      document.querySelectorAll('.admin-text-selected').forEach(el => {
        el.classList.remove('admin-text-selected');
      });
      element.classList.add('admin-text-selected');
      
      toast({
        title: "Text Selected",
        description: `Selected "${editableElement.originalText.substring(0, 30)}..."`,
      });
    }
  };

  const isEditableElement = (element: HTMLElement): boolean => {
    const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'INPUT', 'TEXTAREA'];
    const skipClasses = ['admin-text-highlight', 'admin-text-selected'];
    
    return (
      !skipTags.includes(element.tagName) &&
      !skipClasses.some(cls => element.classList.contains(cls)) &&
      element.textContent &&
      element.textContent.trim().length > 0 &&
      element.textContent.trim().length < 500 &&
      !element.closest('[data-no-edit]')
    );
  };

  const generateSelector = (element: HTMLElement): string => {
    // Generate a unique CSS selector for the element
    const parts: string[] = [];
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += `#${current.id}`;
        parts.unshift(selector);
        break;
      } else if (current.className) {
        const classes = current.className.split(' ').filter(c => c.trim());
        if (classes.length > 0) {
          selector += '.' + classes.join('.');
        }
      }
      
      // Add nth-child if needed for uniqueness
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

  const getElementType = (element: HTMLElement): string => {
    const tagMap: { [key: string]: string } = {
      'H1': 'header',
      'H2': 'header',
      'H3': 'header',
      'H4': 'header',
      'H5': 'header',
      'H6': 'header',
      'BUTTON': 'button',
      'A': 'link',
      'P': 'paragraph',
      'SPAN': 'text',
      'DIV': 'text',
      'LI': 'list-item',
      'LABEL': 'label'
    };
    
    return tagMap[element.tagName] || 'text';
  };

  const saveTextEdit = async () => {
    if (!selectedElements.length || !newText.trim()) return;
    
    setLoading(true);
    try {
      const element = selectedElements[0];
      
      const { error } = await supabase
        .from('website_texts')
        .upsert({
          selector: element.selector,
          original_text: element.originalText,
          edited_text: newText.trim(),
          page_path: window.location.pathname,
          element_type: element.elementType,
          is_active: true
        }, {
          onConflict: 'selector,page_path'
        });

      if (error) throw error;
      
      // Apply the edit immediately
      element.element.textContent = newText.trim();
      element.element.setAttribute('data-edited', 'true');
      
      toast({
        title: "✅ Text Updated",
        description: "Text has been updated and saved to database.",
      });
      
      // Clear selection
      setSelectedElements([]);
      setNewText('');
      
      // Reload website texts
      loadWebsiteTexts();
      
    } catch (error) {
      console.error('Failed to save text edit:', error);
      toast({
        title: "Error",
        description: "Failed to save text edit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTextEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('website_texts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Text edit deleted",
        description: "The text edit has been removed.",
      });
      
      loadWebsiteTexts();
    } catch (error) {
      console.error('Failed to delete text edit:', error);
      toast({
        title: "Error",
        description: "Failed to delete text edit.",
        variant: "destructive",
      });
    }
  };

  const toggleTextEdit = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('website_texts')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      
      loadWebsiteTexts();
    } catch (error) {
      console.error('Failed to toggle text edit:', error);
    }
  };

  return (
    <>
      {/* Edit Mode Styles */}
      <style>{`
        .admin-text-highlight {
          background-color: rgba(59, 130, 246, 0.2) !important;
          outline: 2px solid #3b82f6 !important;
          cursor: pointer !important;
        }
        
        .admin-text-selected {
          background-color: rgba(16, 185, 129, 0.3) !important;
          outline: 2px solid #10b981 !important;
        }
        
        [data-edited="true"] {
          background-color: rgba(34, 197, 94, 0.1);
          border-left: 3px solid #22c55e;
        }
      `}</style>

      {/* Main Control Panel */}
      <Card className="fixed top-4 right-4 w-96 max-h-[80vh] z-50 shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Drag & Drop Text Editor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Switch
              checked={isEditMode}
              onCheckedChange={isEditMode ? disableEditMode : enableEditMode}
            />
            <span className="text-sm">
              {isEditMode ? 'Edit Mode ON' : 'Edit Mode OFF'}
            </span>
            {isEditMode && <Zap className="w-4 h-4 text-primary animate-pulse" />}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Selected Element Editor */}
          {selectedElements.length > 0 && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                <span className="font-medium">Edit Selected Text</span>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Original: "{selectedElements[0].originalText.substring(0, 50)}..."
                </div>
                <Textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Enter new text..."
                  className="min-h-[60px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={saveTextEdit}
                    disabled={loading || !newText.trim()}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedElements([]);
                      setNewText('');
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Existing Text Edits */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Current Page Edits</span>
              <Button
                size="sm"
                variant="outline"
                onClick={loadWebsiteTexts}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {websiteTexts.map((textEdit) => (
                  <div
                    key={textEdit.id}
                    className="p-3 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {textEdit.element_type}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleTextEdit(textEdit.id, textEdit.is_active)}
                        >
                          {textEdit.is_active ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTextEdit(textEdit.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-xs space-y-1">
                      <div className="text-muted-foreground">
                        Original: "{textEdit.original_text.substring(0, 40)}..."
                      </div>
                      <div className="text-primary">
                        Edited: "{textEdit.edited_text.substring(0, 40)}..."
                      </div>
                    </div>
                  </div>
                ))}
                
                {websiteTexts.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No text edits on this page yet.
                    <br />
                    Enable edit mode to start editing!
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Instructions Overlay */}
      {isEditMode && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
          <Card className="p-4 shadow-xl bg-primary/10 border-primary/20">
            <div className="flex items-center gap-2 text-primary">
              <MousePointer className="w-5 h-5" />
              <span className="font-medium">Click on any text to edit it</span>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
