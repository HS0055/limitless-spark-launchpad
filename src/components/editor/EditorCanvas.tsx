import { useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Trash2, 
  Move, 
  Eye, 
  EyeOff,
  Settings,
  Lock,
  Unlock,
  Grid
} from 'lucide-react';
import { EditorComponent, EditorPage } from '@/pages/EditorApp';

interface EditorCanvasProps {
  page: EditorPage;
  selectedComponent: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (id: string, updates: Partial<EditorComponent>) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
  isPreviewMode: boolean;
}

const EditorCanvas = ({
  page,
  selectedComponent,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onDuplicateComponent,
  isPreviewMode
}: EditorCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);

  const [{ isOver }, drop] = useDrop({
    accept: 'component',
    drop: (item: any, monitor) => {
      if (!monitor.didDrop()) {
        const offset = monitor.getClientOffset();
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        
        if (offset && canvasRect) {
          const x = offset.x - canvasRect.left;
          const y = offset.y - canvasRect.top;
          
          if (item.id) {
            // Moving existing component
            onUpdateComponent(item.id, {
              position: { x: Math.max(0, x - 50), y: Math.max(0, y - 25) }
            });
          }
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true })
    })
  });

  const renderComponent = (component: EditorComponent) => {
    const isSelected = selectedComponent === component.id;
    const isDragging = draggedComponent === component.id;

    const baseClasses = `
      absolute border-2 transition-all duration-200 cursor-pointer
      ${isSelected ? 'border-primary border-dashed shadow-lg z-10' : 'border-transparent hover:border-primary/50'}
      ${isDragging ? 'opacity-50 z-20' : ''}
      ${isPreviewMode ? 'border-none hover:border-none cursor-default' : ''}
    `;

    const componentStyle = {
      left: component.position.x,
      top: component.position.y,
      width: component.size.width,
      height: component.size.height,
      ...component.styles
    };

    const handleClick = (e: React.MouseEvent) => {
      if (isPreviewMode) return;
      e.stopPropagation();
      onSelectComponent(component.id);
    };

    const renderComponentContent = () => {
      switch (component.type) {
        case 'text':
          const TextTag = component.content.tag || 'p';
          return (
            <TextTag 
              className="w-full h-full flex items-center"
              style={{ ...component.styles }}
            >
              {component.content.text || 'Text Element'}
            </TextTag>
          );

        case 'button':
          return (
            <button 
              className="w-full h-full transition-all duration-200"
              style={{ ...component.styles }}
              onClick={(e) => isPreviewMode ? undefined : e.preventDefault()}
            >
              {component.content.text || 'Button'}
            </button>
          );

        case 'image':
          return (
            <div className="w-full h-full">
              {component.content.src ? (
                <img 
                  src={component.content.src}
                  alt={component.content.alt || 'Image'}
                  className="w-full h-full object-cover"
                  style={{ borderRadius: component.styles.borderRadius }}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                  <div className="text-center">
                    <Eye className="w-8 h-8 mx-auto mb-2" />
                    <p>Click to add image</p>
                  </div>
                </div>
              )}
              {component.content.caption && (
                <p className="text-sm text-center mt-2 text-gray-600">
                  {component.content.caption}
                </p>
              )}
            </div>
          );

        case 'container':
          return (
            <div 
              className="w-full h-full"
              style={{ 
                backgroundColor: component.content.background || 'transparent',
                ...component.styles 
              }}
            >
              {!isPreviewMode && (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  Container
                </div>
              )}
            </div>
          );

        case 'form':
          return (
            <div className="w-full h-full p-4">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full p-2 border rounded" 
                    placeholder="your@email.com"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground p-2 rounded"
                  onClick={(e) => !isPreviewMode && e.preventDefault()}
                >
                  {component.content.submitText || 'Submit'}
                </button>
              </form>
            </div>
          );

        case 'gallery':
          return (
            <div className="w-full h-full p-4">
              <div 
                className="grid gap-2 h-full"
                style={{ 
                  gridTemplateColumns: `repeat(${component.content.columns || 3}, 1fr)` 
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div 
                    key={i} 
                    className="bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs"
                  >
                    Image {i}
                  </div>
                ))}
              </div>
            </div>
          );

        case 'navigation':
          return (
            <nav className="w-full h-full flex items-center" style={component.styles}>
              <ul className="flex space-x-6">
                {(component.content.items || [{ text: 'Home', href: '#' }]).map((item: any, index: number) => (
                  <li key={index}>
                    <a 
                      href={item.href} 
                      className="hover:text-primary transition-colors"
                      onClick={(e) => !isPreviewMode && e.preventDefault()}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          );

        default:
          return (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Unknown Component
            </div>
          );
      }
    };

    return (
      <div
        key={component.id}
        className={baseClasses}
        style={componentStyle}
        onClick={handleClick}
        data-component-id={component.id}
      >
        {renderComponentContent()}
        
        {/* Component Controls */}
        {isSelected && !isPreviewMode && (
          <div className="absolute -top-10 left-0 flex items-center gap-1 bg-background border rounded-md shadow-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateComponent(component.id);
              }}
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteComponent(component.id);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Resize handles */}
        {isSelected && !isPreviewMode && (
          <>
            <div 
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border border-background cursor-se-resize"
              onMouseDown={(e) => {
                e.stopPropagation();
                // Resize logic would go here
              }}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={(node) => {
        canvasRef.current = node;
        drop(node);
      }}
      className={`
        relative min-h-full w-full
        ${isOver ? 'bg-primary/5' : ''}
        ${isPreviewMode ? '' : 'bg-white'}
      `}
      style={{
        backgroundColor: page.settings.backgroundColor,
        fontFamily: page.settings.fontFamily,
        padding: page.settings.padding,
        maxWidth: page.settings.maxWidth,
        margin: '0 auto'
      }}
      onClick={() => !isPreviewMode && onSelectComponent(null)}
    >
      {/* Canvas Grid (only in edit mode) */}
      {!isPreviewMode && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      )}

      {/* Components */}
      {page.components.map(renderComponent)}

      {/* Empty state */}
      {page.components.length === 0 && !isPreviewMode && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Grid className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Empty Canvas</h3>
            <p className="text-sm">
              Add components from the library to start building your page
            </p>
          </div>
        </div>
      )}

      {/* Drop overlay */}
      {isOver && !isPreviewMode && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary flex items-center justify-center">
          <div className="text-center text-primary">
            <Move className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Drop component here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorCanvas;