import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Wand2, Save, RotateCcw, Copy, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParsedComponent {
  id: string;
  tagName: string;
  textContent: string;
  attributes: Record<string, string>;
  children: ParsedComponent[];
  depth: number;
}

interface ElementEditorProps {
  component: ParsedComponent;
  onUpdateComponent: (updatedComponent: ParsedComponent) => void;
}

export const ElementEditor: React.FC<ElementEditorProps> = ({ 
  component, 
  onUpdateComponent 
}) => {
  const [editedComponent, setEditedComponent] = useState<ParsedComponent>(component);
  const [newAttributeKey, setNewAttributeKey] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setEditedComponent(component);
  }, [component]);

  const handleTextContentChange = (newText: string) => {
    setEditedComponent(prev => ({
      ...prev,
      textContent: newText
    }));
  };

  const handleAttributeChange = (key: string, value: string) => {
    setEditedComponent(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key]: value
      }
    }));
  };

  const handleAddAttribute = () => {
    if (!newAttributeKey.trim() || !newAttributeValue.trim()) {
      toast({
        title: "Invalid attribute",
        description: "Both key and value are required.",
        variant: "destructive",
      });
      return;
    }

    setEditedComponent(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [newAttributeKey]: newAttributeValue
      }
    }));

    setNewAttributeKey('');
    setNewAttributeValue('');
    
    toast({
      title: "Attribute added",
      description: `Added ${newAttributeKey}="${newAttributeValue}"`,
    });
  };

  const handleRemoveAttribute = (key: string) => {
    setEditedComponent(prev => {
      const newAttributes = { ...prev.attributes };
      delete newAttributes[key];
      return {
        ...prev,
        attributes: newAttributes
      };
    });
    
    toast({
      title: "Attribute removed",
      description: `Removed ${key} attribute`,
    });
  };

  const handleSave = () => {
    onUpdateComponent(editedComponent);
    toast({
      title: "Changes saved",
      description: "Element has been updated successfully.",
    });
  };

  const handleReset = () => {
    setEditedComponent(component);
    toast({
      title: "Changes reset",
      description: "Reverted to original values.",
    });
  };

  const handleCopyElement = () => {
    const elementHtml = `<${editedComponent.tagName}${Object.entries(editedComponent.attributes)
      .map(([key, value]) => ` ${key}="${value}"`)
      .join('')}>${editedComponent.textContent}</${editedComponent.tagName}>`;
    
    navigator.clipboard.writeText(elementHtml);
    toast({
      title: "Copied to clipboard",
      description: "Element HTML has been copied.",
    });
  };

  const generateAIContent = async () => {
    // Placeholder for AI content generation
    toast({
      title: "AI Enhancement",
      description: "AI content generation will be implemented in Phase 2.",
    });
  };

  return (
    <div className="space-y-4">
      {/* Element Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {editedComponent.tagName}
          </Badge>
          {editedComponent.attributes.id && (
            <Badge variant="outline" className="text-xs">
              #{editedComponent.attributes.id}
            </Badge>
          )}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={handleCopyElement}>
            <Copy className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={generateAIContent}>
            <Wand2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-content">Text Content</Label>
            <Textarea
              id="text-content"
              value={editedComponent.textContent}
              onChange={(e) => handleTextContentChange(e.target.value)}
              placeholder="Element text content..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              Edit the text content of this element
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={generateAIContent} variant="outline" className="flex-1">
              <Wand2 className="w-4 h-4 mr-2" />
              Enhance with AI
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="attributes" className="space-y-4">
          {/* Existing Attributes */}
          <div className="space-y-3">
            <Label>Existing Attributes</Label>
            {Object.entries(editedComponent.attributes).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(editedComponent.attributes).map(([key, value]) => (
                  <div key={key} className="flex gap-2 items-center">
                    <Input
                      value={key}
                      disabled
                      className="w-32 text-sm"
                    />
                    <Input
                      value={value}
                      onChange={(e) => handleAttributeChange(key, e.target.value)}
                      className="flex-1 text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveAttribute(key)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No attributes found</p>
            )}
          </div>

          <Separator />

          {/* Add New Attribute */}
          <div className="space-y-3">
            <Label>Add New Attribute</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Attribute name"
                value={newAttributeKey}
                onChange={(e) => setNewAttributeKey(e.target.value)}
                className="w-32"
              />
              <Input
                placeholder="Attribute value"
                value={newAttributeValue}
                onChange={(e) => setNewAttributeValue(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddAttribute}>Add</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <div className="space-y-2">
            <Label>HTML Preview</Label>
            <Card className="p-4">
              <code className="text-sm block whitespace-pre-wrap break-all">
                &lt;{editedComponent.tagName}
                {Object.entries(editedComponent.attributes).map(([key, value]) => (
                  <span key={key}> {key}="{value}"</span>
                ))}
                &gt;
                <br />
                {editedComponent.textContent && (
                  <>
                    {editedComponent.textContent}
                    <br />
                  </>
                )}
                &lt;/{editedComponent.tagName}&gt;
              </code>
            </Card>
          </div>

          <div className="space-y-2">
            <Label>Visual Preview</Label>
            <Card className="p-4 bg-muted/30">
              <div 
                dangerouslySetInnerHTML={{
                  __html: `<${editedComponent.tagName}${Object.entries(editedComponent.attributes)
                    .map(([key, value]) => ` ${key}="${value}"`)
                    .join('')}>${editedComponent.textContent}</${editedComponent.tagName}>`
                }}
                className="prose dark:prose-invert max-w-none"
              />
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <Button onClick={handleSave} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
};
