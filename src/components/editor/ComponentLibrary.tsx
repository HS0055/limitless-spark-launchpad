import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Type, 
  Image, 
  Square, 
  Layout,
  FileText,
  Grid, 
  Navigation,
  MousePointer,
  Video,
  BarChart3
} from 'lucide-react';

export interface ComponentType {
  type: 'text' | 'image' | 'button' | 'container' | 'form' | 'gallery' | 'navigation';
  icon: any;
  label: string;
  description: string;
  category: 'basic' | 'media' | 'forms' | 'layout' | 'advanced';
}

interface ComponentLibraryProps {
  onAddComponent: (type: ComponentType['type']) => void;
}

const componentLibrary: ComponentType[] = [
  // Basic Components
  {
    type: 'text',
    icon: Type,
    label: 'Text',
    description: 'Add headings, paragraphs, or any text content',
    category: 'basic'
  },
  {
    type: 'button',
    icon: Square,
    label: 'Button',
    description: 'Interactive button with customizable styles',
    category: 'basic'
  },
  {
    type: 'image',
    icon: Image,
    label: 'Image',
    description: 'Upload or link to images with captions',
    category: 'media'
  },
  
  // Layout Components
  {
    type: 'container',
    icon: Layout,
    label: 'Container',
    description: 'Group other components together',
    category: 'layout'
  },
  
  // Form Components
  {
    type: 'form',
    icon: FileText,
    label: 'Form',
    description: 'Contact forms, surveys, and data collection',
    category: 'forms'
  },
  
  // Advanced Components
  {
    type: 'gallery',
    icon: Grid,
    label: 'Gallery',
    description: 'Image galleries and photo collections',
    category: 'advanced'
  },
  {
    type: 'navigation',
    icon: Navigation,
    label: 'Navigation',
    description: 'Navigation menus and breadcrumbs',
    category: 'advanced'
  }
];

const ComponentLibrary = ({ onAddComponent }: ComponentLibraryProps) => {
  const categories = [
    { id: 'basic', name: 'Basic', icon: MousePointer },
    { id: 'media', name: 'Media', icon: Image },
    { id: 'forms', name: 'Forms', icon: FileText },
    { id: 'layout', name: 'Layout', icon: Layout },
    { id: 'advanced', name: 'Advanced', icon: BarChart3 }
  ];

  const getComponentsByCategory = (category: string) => {
    return componentLibrary.filter(component => component.category === category);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Components</h3>
      </div>
      
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6">
          {categories.map((category) => {
            const components = getComponentsByCategory(category.id);
            if (components.length === 0) return null;
            
            return (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <category.icon className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    {category.name}
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {components.map((component) => (
                    <Card 
                      key={component.type}
                      className="cursor-pointer hover:shadow-md transition-all duration-200 border-dashed hover:border-primary"
                      onClick={() => onAddComponent(component.type)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <component.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm mb-1">{component.label}</h5>
                            <p className="text-xs text-muted-foreground leading-tight">
                              {component.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      
      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Click any component to add it to your page
        </p>
      </div>
    </div>
  );
};

export default ComponentLibrary;