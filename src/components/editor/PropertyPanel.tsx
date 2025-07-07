import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Trash2, 
  Copy, 
  Settings, 
  Palette, 
  Type, 
  Layout,
  Image,
  Link,
  Eye,
  EyeOff
} from 'lucide-react';
import { EditorComponent } from '@/pages/EditorApp';

interface PropertyPanelProps {
  component: EditorComponent;
  onUpdate: (updates: Partial<EditorComponent>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const PropertyPanel = ({ component, onUpdate, onDelete, onDuplicate }: PropertyPanelProps) => {
  const [activeTab, setActiveTab] = useState('content');

  const updateContent = (key: string, value: any) => {
    onUpdate({
      content: { ...component.content, [key]: value }
    });
  };

  const updateStyle = (key: string, value: any) => {
    onUpdate({
      styles: { ...component.styles, [key]: value }
    });
  };

  const updatePosition = (x?: number, y?: number) => {
    onUpdate({
      position: {
        x: x !== undefined ? x : component.position.x,
        y: y !== undefined ? y : component.position.y
      }
    });
  };

  const updateSize = (width?: number, height?: number) => {
    onUpdate({
      size: {
        width: width !== undefined ? width : component.size.width,
        height: height !== undefined ? height : component.size.height
      }
    });
  };

  const renderContentTab = () => {
    switch (component.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text-content">Text Content</Label>
              <Textarea
                id="text-content"
                value={component.content.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                placeholder="Enter your text..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="text-tag">HTML Tag</Label>
              <Select 
                value={component.content.tag || 'p'} 
                onValueChange={(value) => updateContent('tag', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">Heading 1</SelectItem>
                  <SelectItem value="h2">Heading 2</SelectItem>
                  <SelectItem value="h3">Heading 3</SelectItem>
                  <SelectItem value="h4">Heading 4</SelectItem>
                  <SelectItem value="h5">Heading 5</SelectItem>
                  <SelectItem value="h6">Heading 6</SelectItem>
                  <SelectItem value="p">Paragraph</SelectItem>
                  <SelectItem value="span">Span</SelectItem>
                  <SelectItem value="div">Div</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="button-text">Button Text</Label>
              <Input
                id="button-text"
                value={component.content.text || ''}
                onChange={(e) => updateContent('text', e.target.value)}
                placeholder="Button text..."
              />
            </div>
            <div>
              <Label htmlFor="button-href">Link URL</Label>
              <Input
                id="button-href"
                value={component.content.href || ''}
                onChange={(e) => updateContent('href', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="button-new-tab"
                checked={component.content.openInNewTab || false}
                onCheckedChange={(checked) => updateContent('openInNewTab', checked)}
              />
              <Label htmlFor="button-new-tab">Open in new tab</Label>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-src">Image URL</Label>
              <Input
                id="image-src"
                value={component.content.src || ''}
                onChange={(e) => updateContent('src', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input
                id="image-alt"
                value={component.content.alt || ''}
                onChange={(e) => updateContent('alt', e.target.value)}
                placeholder="Descriptive text..."
              />
            </div>
            <div>
              <Label htmlFor="image-caption">Caption</Label>
              <Input
                id="image-caption"
                value={component.content.caption || ''}
                onChange={(e) => updateContent('caption', e.target.value)}
                placeholder="Image caption..."
              />
            </div>
            {component.content.src && (
              <div className="p-4 border rounded-lg">
                <img 
                  src={component.content.src} 
                  alt={component.content.alt}
                  className="w-full h-auto rounded"
                />
              </div>
            )}
          </div>
        );

      case 'form':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="form-submit">Submit Button Text</Label>
              <Input
                id="form-submit"
                value={component.content.submitText || 'Submit'}
                onChange={(e) => updateContent('submitText', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="form-action">Form Action URL</Label>
              <Input
                id="form-action"
                value={component.content.action || ''}
                onChange={(e) => updateContent('action', e.target.value)}
                placeholder="https://your-form-handler.com"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-muted-foreground py-8">
            <Settings className="w-8 h-8 mx-auto mb-2" />
            <p>No content settings available for this component</p>
          </div>
        );
    }
  };

  const renderStyleTab = () => (
    <div className="space-y-6">
      {/* Typography */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Type className="w-4 h-4" />
          Typography
        </h4>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="font-size">Font Size</Label>
            <Input
              id="font-size"
              value={component.styles.fontSize || '16px'}
              onChange={(e) => updateStyle('fontSize', e.target.value)}
              placeholder="16px"
            />
          </div>
          <div>
            <Label htmlFor="font-weight">Weight</Label>
            <Select 
              value={component.styles.fontWeight || 'normal'} 
              onValueChange={(value) => updateStyle('fontWeight', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">Thin</SelectItem>
                <SelectItem value="300">Light</SelectItem>
                <SelectItem value="400">Normal</SelectItem>
                <SelectItem value="500">Medium</SelectItem>
                <SelectItem value="600">Semi Bold</SelectItem>
                <SelectItem value="700">Bold</SelectItem>
                <SelectItem value="900">Black</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="text-align">Text Align</Label>
          <Select 
            value={component.styles.textAlign || 'left'} 
            onValueChange={(value) => updateStyle('textAlign', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
              <SelectItem value="justify">Justify</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Colors */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Colors
        </h4>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="text-color">Text Color</Label>
            <div className="flex gap-2">
              <Input
                id="text-color"
                type="color"
                value={component.styles.color || '#333333'}
                onChange={(e) => updateStyle('color', e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                value={component.styles.color || '#333333'}
                onChange={(e) => updateStyle('color', e.target.value)}
                className="flex-1"
                placeholder="#333333"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="bg-color">Background</Label>
            <div className="flex gap-2">
              <Input
                id="bg-color"
                type="color"
                value={component.styles.backgroundColor || '#transparent'}
                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                value={component.styles.backgroundColor || 'transparent'}
                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                className="flex-1"
                placeholder="transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Spacing */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Layout className="w-4 h-4" />
          Spacing
        </h4>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="padding">Padding</Label>
            <Input
              id="padding"
              value={component.styles.padding || '10px'}
              onChange={(e) => updateStyle('padding', e.target.value)}
              placeholder="10px"
            />
          </div>
          <div>
            <Label htmlFor="margin">Margin</Label>
            <Input
              id="margin"
              value={component.styles.margin || '0px'}
              onChange={(e) => updateStyle('margin', e.target.value)}
              placeholder="0px"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Border & Effects */}
      <div className="space-y-4">
        <h4 className="font-medium">Border & Effects</h4>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="border-radius">Border Radius</Label>
            <Input
              id="border-radius"
              value={component.styles.borderRadius || '4px'}
              onChange={(e) => updateStyle('borderRadius', e.target.value)}
              placeholder="4px"
            />
          </div>
          <div>
            <Label htmlFor="border">Border</Label>
            <Input
              id="border"
              value={component.styles.border || 'none'}
              onChange={(e) => updateStyle('border', e.target.value)}
              placeholder="1px solid #ccc"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="box-shadow">Box Shadow</Label>
          <Input
            id="box-shadow"
            value={component.styles.boxShadow || 'none'}
            onChange={(e) => updateStyle('boxShadow', e.target.value)}
            placeholder="0 2px 4px rgba(0,0,0,0.1)"
          />
        </div>
      </div>
    </div>
  );

  const renderLayoutTab = () => (
    <div className="space-y-6">
      {/* Position */}
      <div className="space-y-4">
        <h4 className="font-medium">Position</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="pos-x">X Position</Label>
            <Input
              id="pos-x"
              type="number"
              value={component.position.x}
              onChange={(e) => updatePosition(parseInt(e.target.value), undefined)}
            />
          </div>
          <div>
            <Label htmlFor="pos-y">Y Position</Label>
            <Input
              id="pos-y"
              type="number"
              value={component.position.y}
              onChange={(e) => updatePosition(undefined, parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Size */}
      <div className="space-y-4">
        <h4 className="font-medium">Size</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="width">Width</Label>
            <Input
              id="width"
              type="number"
              value={component.size.width}
              onChange={(e) => updateSize(parseInt(e.target.value), undefined)}
            />
          </div>
          <div>
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              type="number"
              value={component.size.height}
              onChange={(e) => updateSize(undefined, parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Z-Index */}
      <div>
        <Label htmlFor="z-index">Z-Index (Layer Order)</Label>
        <Input
          id="z-index"
          type="number"
          value={component.styles.zIndex || 0}
          onChange={(e) => updateStyle('zIndex', parseInt(e.target.value))}
        />
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Component Properties</h3>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onDuplicate}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-3 h-3 bg-primary rounded-sm" />
          <span className="capitalize">{component.type}</span>
          <span>•</span>
          <span>#{component.id.slice(-8)}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
            <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
            <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
            <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
                <TabsContent value="content" className="mt-0">
                  {renderContentTab()}
                </TabsContent>
                
                <TabsContent value="style" className="mt-0">
                  {renderStyleTab()}
                </TabsContent>
                
                <TabsContent value="layout" className="mt-0">
                  {renderLayoutTab()}
                </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default PropertyPanel;