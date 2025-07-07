import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Settings, 
  Eye, 
  Save, 
  Undo, 
  Redo,
  Type,
  Image,
  Square,
  Layout
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PageElement {
  id: string;
  type: 'text' | 'image' | 'button' | 'container';
  content: string;
  styles: Record<string, string>;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface Page {
  id: string;
  name: string;
  path: string;
  elements: PageElement[];
  settings: {
    title: string;
    description: string;
    backgroundColor: string;
  };
}

const VisualEditor = () => {
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const { toast } = useToast();

  // Initialize with a default page
  useEffect(() => {
    const defaultPage: Page = {
      id: 'home',
      name: 'Home Page',
      path: '/',
      elements: [
        {
          id: 'welcome-text',
          type: 'text',
          content: 'Welcome to your website!',
          styles: {
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#333',
            textAlign: 'center'
          },
          position: { x: 50, y: 100 },
          size: { width: 400, height: 50 }
        }
      ],
      settings: {
        title: 'Home Page',
        description: 'Welcome to our website',
        backgroundColor: '#ffffff'
      }
    };
    
    setPages([defaultPage]);
    setCurrentPage(defaultPage);
  }, []);

  const componentLibrary = [
    { type: 'text', icon: Type, label: 'Text' },
    { type: 'image', icon: Image, label: 'Image' },
    { type: 'button', icon: Square, label: 'Button' },
    { type: 'container', icon: Layout, label: 'Container' }
  ];

  const addElement = (type: PageElement['type']) => {
    if (!currentPage) return;

    const newElement: PageElement = {
      id: `element-${Date.now()}`,
      type,
      content: type === 'text' ? 'New Text' : type === 'button' ? 'Click Me' : '',
      styles: {
        fontSize: '16px',
        color: '#333',
        backgroundColor: type === 'button' ? '#007bff' : 'transparent',
        padding: '10px',
        borderRadius: type === 'button' ? '4px' : '0px'
      },
      position: { x: 100, y: 100 },
      size: { width: 200, height: type === 'text' ? 40 : type === 'button' ? 40 : 100 }
    };

    const updatedPage = {
      ...currentPage,
      elements: [...currentPage.elements, newElement]
    };

    setCurrentPage(updatedPage);
    setPages(pages.map(p => p.id === currentPage.id ? updatedPage : p));
    setSelectedElement(newElement.id);
  };

  const updateElement = (elementId: string, updates: Partial<PageElement>) => {
    if (!currentPage) return;

    const updatedElements = currentPage.elements.map(el =>
      el.id === elementId ? { ...el, ...updates } : el
    );

    const updatedPage = {
      ...currentPage,
      elements: updatedElements
    };

    setCurrentPage(updatedPage);
    setPages(pages.map(p => p.id === currentPage.id ? updatedPage : p));
  };

  const deleteElement = (elementId: string) => {
    if (!currentPage) return;

    const updatedElements = currentPage.elements.filter(el => el.id !== elementId);
    const updatedPage = {
      ...currentPage,
      elements: updatedElements
    };

    setCurrentPage(updatedPage);
    setPages(pages.map(p => p.id === currentPage.id ? updatedPage : p));
    setSelectedElement(null);
  };

  const savePage = () => {
    toast({
      title: "Page Saved",
      description: "Your changes have been saved successfully.",
    });
  };

  const selectedElementData = selectedElement 
    ? currentPage?.elements.find(el => el.id === selectedElement)
    : null;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="h-14 border-b flex items-center justify-between px-4 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-lg">Visual Editor</h1>
          {currentPage && (
            <span className="text-sm text-muted-foreground">- {currentPage.name}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
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
          <Button size="sm" onClick={savePage}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar - Components & Pages */}
        {!isPreviewMode && (
          <div className="w-80 border-r bg-background/50 backdrop-blur-sm">
            <Tabs defaultValue="components" className="h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="components">Components</TabsTrigger>
                <TabsTrigger value="pages">Pages</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="components" className="mt-4 px-4">
                <h3 className="font-medium mb-4">Add Components</h3>
                <div className="grid grid-cols-2 gap-2">
                  {componentLibrary.map((component) => (
                    <Button
                      key={component.type}
                      variant="outline"
                      className="h-20 flex-col gap-2"
                      onClick={() => addElement(component.type as PageElement['type'])}
                    >
                      <component.icon className="w-6 h-6" />
                      <span className="text-xs">{component.label}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="pages" className="mt-4 px-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Pages</h3>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <ScrollArea className="h-96">
                  {pages.map((page) => (
                    <Card 
                      key={page.id} 
                      className={`p-3 mb-2 cursor-pointer transition-colors ${
                        currentPage?.id === page.id ? 'border-primary' : ''
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      <div className="font-medium text-sm">{page.name}</div>
                      <div className="text-xs text-muted-foreground">{page.path}</div>
                    </Card>
                  ))}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="settings" className="mt-4 px-4">
                <h3 className="font-medium mb-4">Page Settings</h3>
                {currentPage && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="page-title">Page Title</Label>
                      <Input 
                        id="page-title"
                        value={currentPage.settings.title}
                        onChange={(e) => {
                          const updatedPage = {
                            ...currentPage,
                            settings: { ...currentPage.settings, title: e.target.value }
                          };
                          setCurrentPage(updatedPage);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="page-desc">Description</Label>
                      <Input 
                        id="page-desc"
                        value={currentPage.settings.description}
                        onChange={(e) => {
                          const updatedPage = {
                            ...currentPage,
                            settings: { ...currentPage.settings, description: e.target.value }
                          };
                          setCurrentPage(updatedPage);
                        }}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Main Canvas */}
        <div className="flex-1 bg-muted/20 relative overflow-auto">
          {currentPage && (
            <div 
              className="min-h-full relative"
              style={{ backgroundColor: currentPage.settings.backgroundColor }}
            >
              {currentPage.elements.map((element) => (
                <div
                  key={element.id}
                  className={`absolute border-2 transition-all cursor-pointer ${
                    selectedElement === element.id 
                      ? 'border-primary border-dashed' 
                      : 'border-transparent hover:border-primary/50'
                  }`}
                  style={{
                    left: element.position.x,
                    top: element.position.y,
                    width: element.size.width,
                    height: element.size.height,
                    ...element.styles
                  }}
                  onClick={() => !isPreviewMode && setSelectedElement(element.id)}
                >
                  {element.type === 'text' && (
                    <div className="w-full h-full flex items-center">
                      {element.content}
                    </div>
                  )}
                  {element.type === 'button' && (
                    <button className="w-full h-full">
                      {element.content}
                    </button>
                  )}
                  {element.type === 'image' && (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  {element.type === 'container' && (
                    <div className="w-full h-full border border-dashed border-gray-300">
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar - Properties */}
        {!isPreviewMode && selectedElementData && (
          <div className="w-80 border-l bg-background/50 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Properties</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => deleteElement(selectedElementData.id)}
              >
                Delete
              </Button>
            </div>
            
            <div className="space-y-4">
              {(selectedElementData.type === 'text' || selectedElementData.type === 'button') && (
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Input 
                    id="content"
                    value={selectedElementData.content}
                    onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="font-size">Font Size</Label>
                <Input 
                  id="font-size"
                  value={selectedElementData.styles.fontSize || '16px'}
                  onChange={(e) => updateElement(selectedElementData.id, { 
                    styles: { ...selectedElementData.styles, fontSize: e.target.value }
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="color">Color</Label>
                <Input 
                  id="color"
                  type="color"
                  value={selectedElementData.styles.color || '#333333'}
                  onChange={(e) => updateElement(selectedElementData.id, { 
                    styles: { ...selectedElementData.styles, color: e.target.value }
                  })}
                />
              </div>
              
              {selectedElementData.type === 'button' && (
                <div>
                  <Label htmlFor="bg-color">Background Color</Label>
                  <Input 
                    id="bg-color"
                    type="color"
                    value={selectedElementData.styles.backgroundColor || '#007bff'}
                    onChange={(e) => updateElement(selectedElementData.id, { 
                      styles: { ...selectedElementData.styles, backgroundColor: e.target.value }
                    })}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualEditor;