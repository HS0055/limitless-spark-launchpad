import { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Save, 
  Eye, 
  Undo, 
  Redo,
  Plus,
  Settings,
  Download,
  Upload,
  Trash2,
  Copy,
  Move,
  Layout,
  Type,
  Image,
  Square,
  MousePointer,
  Grid,
  Layers
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

// Component Library
import ComponentLibrary from '@/components/editor/ComponentLibrary';
import EditorCanvas from '@/components/editor/EditorCanvas';
import PropertyPanel from '@/components/editor/PropertyPanel';
import PageManager from '@/components/editor/PageManager';
import TemplateManager from '@/components/editor/TemplateManager';

// Types
export interface EditorComponent {
  id: string;
  type: 'text' | 'image' | 'button' | 'container' | 'form' | 'gallery' | 'navigation';
  content: Record<string, any>;
  styles: Record<string, any>;
  position: { x: number; y: number };
  size: { width: number; height: number };
  properties: Record<string, any>;
  parentId?: string;
  orderIndex: number;
}

export interface EditorPage {
  id: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  metaData: Record<string, any>;
  settings: {
    backgroundColor: string;
    fontFamily: string;
    maxWidth: string;
    padding: string;
    seo: {
      title: string;
      description: string;
      keywords: string[];
    };
  };
  isPublished: boolean;
  isTemplate: boolean;
  createdBy: string;
  components: EditorComponent[];
}

const EditorApp = () => {
  const [currentPage, setCurrentPage] = useState<EditorPage | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pages, setPages] = useState<EditorPage[]>([]);
  const [undoStack, setUndoStack] = useState<EditorPage[]>([]);
  const [redoStack, setRedoStack] = useState<EditorPage[]>([]);
  const { toast } = useToast();
  const { user, userRole } = useAuth();

  // Load user pages
  useEffect(() => {
    if (user) {
      loadUserPages();
    }
  }, [user]);

  const loadUserPages = async () => {
    try {
      setIsLoading(true);
      const { data: pagesData, error: pagesError } = await supabase
        .from('editor_pages')
        .select('*')
        .eq('created_by', user?.id)
        .order('updated_at', { ascending: false });

      if (pagesError) throw pagesError;

      const pagesWithComponents = await Promise.all(
        (pagesData || []).map(async (page) => {
          const { data: components, error: componentsError } = await supabase
            .from('editor_components')
            .select('*')
            .eq('page_id', page.id)
            .order('order_index');

          if (componentsError) throw componentsError;

          return {
            ...page,
            components: (components || []).map((c: any) => ({
              ...c,
              orderIndex: c.order_index || 0,
              parentId: c.parent_id || undefined
            })),
            metaData: page.meta_data || {},
            isPublished: page.is_published || false,
            isTemplate: page.is_template || false,
            createdBy: page.created_by || '',
            settings: page.settings || {
              backgroundColor: '#ffffff',
              fontFamily: 'Inter',
              maxWidth: '1200px',
              padding: '20px',
              seo: {
                title: page.title || '',
                description: page.description || '',
                keywords: []
              }
            }
          } as EditorPage;
        })
      );

      setPages(pagesWithComponents);
      
      // Set first page as current if none selected
      if (!currentPage && pagesWithComponents.length > 0) {
        setCurrentPage(pagesWithComponents[0]);
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
      toast({
        title: "Error",
        description: "Failed to load your pages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveCurrentPage = async () => {
    if (!currentPage || !user) return;

    try {
      setIsLoading(true);

      // Save or update page
      const pageData = {
        name: currentPage.name,
        slug: currentPage.slug,
        title: currentPage.title,
        description: currentPage.description,
        meta_data: currentPage.metaData,
        settings: currentPage.settings,
        is_published: currentPage.isPublished,
        is_template: currentPage.isTemplate,
        created_by: user.id
      };

      let pageId = currentPage.id;

      if (currentPage.id.startsWith('temp-')) {
        // Create new page
        const { data: newPage, error: pageError } = await supabase
          .from('editor_pages')
          .insert(pageData)
          .select()
          .single();

        if (pageError) throw pageError;
        pageId = newPage.id;
      } else {
        // Update existing page
        const { error: pageError } = await supabase
          .from('editor_pages')
          .update(pageData)
          .eq('id', currentPage.id);

        if (pageError) throw pageError;
      }

      // Delete existing components
      if (!currentPage.id.startsWith('temp-')) {
        await supabase
          .from('editor_components')
          .delete()
          .eq('page_id', currentPage.id);
      }

      // Save components
      if (currentPage.components.length > 0) {
        const componentsData = currentPage.components.map((component, index) => ({
          page_id: pageId,
          type: component.type,
          content: component.content,
          styles: component.styles,
          position: component.position,
          size: component.size,
          properties: component.properties,
          parent_id: component.parentId || null,
          order_index: index
        }));

        const { error: componentsError } = await supabase
          .from('editor_components')
          .insert(componentsData);

        if (componentsError) throw componentsError;
      }

      // Update local state
      const updatedPage = { ...currentPage, id: pageId };
      setCurrentPage(updatedPage);
      
      // Update pages list
      setPages(prev => {
        const existingIndex = prev.findIndex(p => p.id === currentPage.id);
        if (existingIndex >= 0) {
          const newPages = [...prev];
          newPages[existingIndex] = updatedPage;
          return newPages;
        } else {
          return [updatedPage, ...prev];
        }
      });

      toast({
        title: "Success",
        description: "Page saved successfully",
      });
    } catch (error) {
      console.error('Failed to save page:', error);
      toast({
        title: "Error",
        description: "Failed to save page",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewPage = () => {
    const newPage: EditorPage = {
      id: `temp-${Date.now()}`,
      name: 'Untitled Page',
      slug: `page-${Date.now()}`,
      title: 'New Page',
      description: '',
      metaData: {},
      settings: {
        backgroundColor: '#ffffff',
        fontFamily: 'Inter',
        maxWidth: '1200px',
        padding: '20px',
        seo: {
          title: '',
          description: '',
          keywords: []
        }
      },
      isPublished: false,
      isTemplate: false,
      createdBy: user?.id || '',
      components: []
    };

    setCurrentPage(newPage);
    setSelectedComponent(null);
    pushToUndoStack();
  };

  const addComponent = (type: EditorComponent['type']) => {
    if (!currentPage) return;

    const newComponent: EditorComponent = {
      id: `component-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
      position: { x: 100, y: 100 },
      size: getDefaultSize(type),
      properties: {},
      orderIndex: currentPage.components.length
    };

    pushToUndoStack();
    
    const updatedPage = {
      ...currentPage,
      components: [...currentPage.components, newComponent]
    };

    setCurrentPage(updatedPage);
    setSelectedComponent(newComponent.id);
  };

  const updateComponent = (componentId: string, updates: Partial<EditorComponent>) => {
    if (!currentPage) return;

    pushToUndoStack();

    const updatedComponents = currentPage.components.map(component =>
      component.id === componentId ? { ...component, ...updates } : component
    );

    setCurrentPage({
      ...currentPage,
      components: updatedComponents
    });
  };

  const deleteComponent = (componentId: string) => {
    if (!currentPage) return;

    pushToUndoStack();

    const updatedComponents = currentPage.components.filter(
      component => component.id !== componentId
    );

    setCurrentPage({
      ...currentPage,
      components: updatedComponents
    });

    setSelectedComponent(null);
  };

  const duplicateComponent = (componentId: string) => {
    if (!currentPage) return;

    const component = currentPage.components.find(c => c.id === componentId);
    if (!component) return;

    const duplicatedComponent: EditorComponent = {
      ...component,
      id: `component-${Date.now()}`,
      position: {
        x: component.position.x + 20,
        y: component.position.y + 20
      },
      orderIndex: currentPage.components.length
    };

    pushToUndoStack();

    setCurrentPage({
      ...currentPage,
      components: [...currentPage.components, duplicatedComponent]
    });

    setSelectedComponent(duplicatedComponent.id);
  };

  const pushToUndoStack = () => {
    if (!currentPage) return;
    
    setUndoStack(prev => [...prev.slice(-9), currentPage]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length === 0 || !currentPage) return;

    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [currentPage, ...prev.slice(0, 9)]);
    setUndoStack(prev => prev.slice(0, -1));
    setCurrentPage(previousState);
  };

  const redo = () => {
    if (redoStack.length === 0) return;

    const nextState = redoStack[0];
    setUndoStack(prev => [...prev, currentPage!]);
    setRedoStack(prev => prev.slice(1));
    setCurrentPage(nextState);
  };

  const getDefaultContent = (type: EditorComponent['type']) => {
    switch (type) {
      case 'text':
        return { text: 'New Text Element', tag: 'p' };
      case 'button':
        return { text: 'Click Me', href: '#' };
      case 'image':
        return { src: '', alt: 'Image', caption: '' };
      case 'container':
        return { background: 'transparent' };
      case 'form':
        return { fields: [], submitText: 'Submit' };
      case 'gallery':
        return { images: [], columns: 3 };
      case 'navigation':
        return { items: [{ text: 'Home', href: '#' }] };
      default:
        return {};
    }
  };

  const getDefaultStyles = (type: EditorComponent['type']) => {
    const base = {
      color: '#333333',
      fontSize: '16px',
      fontFamily: 'Inter',
      padding: '10px',
      margin: '0px',
      borderRadius: '4px',
      border: 'none',
      backgroundColor: 'transparent'
    };

    switch (type) {
      case 'button':
        return {
          ...base,
          backgroundColor: '#007bff',
          color: '#ffffff',
          padding: '12px 24px',
          cursor: 'pointer',
          textAlign: 'center',
          fontWeight: '500'
        };
      case 'container':
        return {
          ...base,
          border: '1px dashed #ccc',
          minHeight: '100px',
          backgroundColor: '#f9f9f9'
        };
      default:
        return base;
    }
  };

  const getDefaultSize = (type: EditorComponent['type']) => {
    switch (type) {
      case 'text':
        return { width: 300, height: 40 };
      case 'button':
        return { width: 150, height: 44 };
      case 'image':
        return { width: 200, height: 150 };
      case 'container':
        return { width: 400, height: 200 };
      case 'form':
        return { width: 350, height: 300 };
      case 'gallery':
        return { width: 500, height: 300 };
      case 'navigation':
        return { width: 600, height: 60 };
      default:
        return { width: 200, height: 100 };
    }
  };

  const selectedComponentData = selectedComponent 
    ? currentPage?.components.find(c => c.id === selectedComponent)
    : null;

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Card className="p-8">
          <CardContent>
            <p className="text-center text-lg">Please log in to access the editor</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-background">
        {/* Top Toolbar */}
        <div className="h-16 border-b flex items-center justify-between px-4 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-xl">Visual Editor</h1>
            {currentPage && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm font-medium">{currentPage.name}</span>
                {currentPage.isPublished && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Published
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={undo}
              disabled={undoStack.length === 0}
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={redo}
              disabled={redoStack.length === 0}
            >
              <Redo className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreviewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button 
              size="sm" 
              onClick={saveCurrentPage}
              disabled={isLoading || !currentPage}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Left Sidebar */}
          {!isPreviewMode && (
            <div className="w-80 border-r bg-background/50 backdrop-blur-sm">
              <Tabs defaultValue="components" className="h-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="components">
                    <Layout className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value="pages">
                    <Layers className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value="templates">
                    <Grid className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Settings className="w-4 h-4" />
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="components" className="mt-4 px-4">
                  <ComponentLibrary onAddComponent={addComponent} />
                </TabsContent>
                
                <TabsContent value="pages" className="mt-4 px-4">
                  <PageManager 
                    pages={pages}
                    currentPage={currentPage}
                    onSelectPage={setCurrentPage}
                    onCreatePage={createNewPage}
                    onDeletePage={(pageId) => {
                      setPages(prev => prev.filter(p => p.id !== pageId));
                      if (currentPage?.id === pageId) {
                        setCurrentPage(pages.find(p => p.id !== pageId) || null);
                      }
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="templates" className="mt-4 px-4">
                  <TemplateManager 
                    onApplyTemplate={(template) => {
                      // Apply template logic here
                      toast({
                        title: "Template Applied",
                        description: `Applied ${template.name} template`,
                      });
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="settings" className="mt-4 px-4">
                  {currentPage && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="page-name">Page Name</Label>
                        <Input 
                          id="page-name"
                          value={currentPage.name}
                          onChange={(e) => setCurrentPage({
                            ...currentPage,
                            name: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="page-title">Page Title</Label>
                        <Input 
                          id="page-title"
                          value={currentPage.title}
                          onChange={(e) => setCurrentPage({
                            ...currentPage,
                            title: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="page-description">Description</Label>
                        <Textarea 
                          id="page-description"
                          value={currentPage.description}
                          onChange={(e) => setCurrentPage({
                            ...currentPage,
                            description: e.target.value
                          })}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="published"
                          checked={currentPage.isPublished}
                          onCheckedChange={(checked) => setCurrentPage({
                            ...currentPage,
                            isPublished: checked
                          })}
                        />
                        <Label htmlFor="published">Published</Label>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Main Canvas */}
          <div className="flex-1 bg-muted/20 relative overflow-auto">
            {currentPage ? (
              <EditorCanvas
                page={currentPage}
                selectedComponent={selectedComponent}
                onSelectComponent={setSelectedComponent}
                onUpdateComponent={updateComponent}
                onDeleteComponent={deleteComponent}
                onDuplicateComponent={duplicateComponent}
                isPreviewMode={isPreviewMode}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Layout className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Page Selected</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a new page or select an existing one to start editing
                  </p>
                  <Button onClick={createNewPage}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Page
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Properties */}
          {!isPreviewMode && selectedComponentData && (
            <div className="w-80 border-l bg-background/50 backdrop-blur-sm">
              <PropertyPanel
                component={selectedComponentData}
                onUpdate={(updates) => updateComponent(selectedComponentData.id, updates)}
                onDelete={() => deleteComponent(selectedComponentData.id)}
                onDuplicate={() => duplicateComponent(selectedComponentData.id)}
              />
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default EditorApp;