import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Lightbulb, Settings, Wand2 } from 'lucide-react';

interface PromptBuilderProps {
  activeGenerationType: string;
}

const promptTemplates = {
  enhance: [
    "Make this more engaging",
    "Improve readability",
    "Add emotional appeal",
    "Make it more concise",
    "Add specific examples",
    "Improve call-to-action"
  ],
  structure: [
    "Suggest better HTML structure",
    "Optimize for accessibility",
    "Improve semantic markup",
    "Add missing elements",
    "Optimize for mobile",
    "Improve performance"
  ],
  seo: [
    "Generate meta description",
    "Create title variations",
    "Add schema markup",
    "Generate alt text",
    "Create keyword list",
    "Optimize headings"
  ],
  translate: [
    "Professional translation",
    "Localize for culture",
    "Maintain brand voice",
    "Technical translation",
    "Marketing adaptation",
    "Formal tone"
  ]
};

export const PromptBuilder: React.FC<PromptBuilderProps> = ({ activeGenerationType }) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);

  const currentTemplates = promptTemplates[activeGenerationType as keyof typeof promptTemplates] || [];

  useEffect(() => {
    setSelectedModifiers([]);
    setCustomPrompt('');
  }, [activeGenerationType]);

  const toggleModifier = (modifier: string) => {
    setSelectedModifiers(prev => 
      prev.includes(modifier) 
        ? prev.filter(m => m !== modifier)
        : [...prev, modifier]
    );
  };

  const generatePromptSuggestion = () => {
    const suggestions = {
      enhance: "Focus on improving clarity, engagement, and readability while maintaining the original message.",
      structure: "Analyze the HTML structure and suggest improvements for semantics, accessibility, and performance.",
      seo: "Generate SEO-optimized content including meta tags, descriptions, and keyword-rich text.",
      translate: "Provide accurate translation while preserving context, tone, and cultural relevance."
    };

    setCustomPrompt(suggestions[activeGenerationType as keyof typeof suggestions] || '');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Prompt Builder</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">Quick Modifiers</Label>
          <div className="flex flex-wrap gap-2">
            {currentTemplates.map((template, index) => (
              <Badge
                key={index}
                variant={selectedModifiers.includes(template) ? "default" : "secondary"}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => toggleModifier(template)}
              >
                {template}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="custom-prompt">Custom Instructions</Label>
          <Textarea
            id="custom-prompt"
            placeholder="Add specific instructions for AI generation..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={generatePromptSuggestion}
          className="w-full"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Generate Prompt Suggestion
        </Button>

        {(selectedModifiers.length > 0 || customPrompt) && (
          <div className="p-3 bg-muted/50 rounded border">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Effective Prompt Preview</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {selectedModifiers.length > 0 && (
                <div className="mb-1">
                  <strong>Modifiers:</strong> {selectedModifiers.join(', ')}
                </div>
              )}
              {customPrompt && (
                <div>
                  <strong>Custom:</strong> {customPrompt}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p><strong>Tip:</strong> Combine multiple modifiers for more specific results. The AI will use these instructions to generate better content.</p>
        </div>
      </div>
    </Card>
  );
};