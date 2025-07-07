import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentGenerator } from '@/components/ai-content/ContentGenerator';
import { PromptBuilder } from '@/components/ai-content/PromptBuilder';
import { Sparkles, Wand2, Target, Globe } from 'lucide-react';

interface GenerationResult {
  content: string;
  type: string;
  language?: string;
}

const AIContentStudio = () => {
  const [generationResults, setGenerationResults] = useState<GenerationResult[]>([]);
  const [activeTab, setActiveTab] = useState('enhance');

  const handleGenerationResult = (result: GenerationResult) => {
    setGenerationResults(prev => [result, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI Content Studio
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate, enhance, and optimize your web content with AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generation Controls */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="enhance" className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    Enhance
                  </TabsTrigger>
                  <TabsTrigger value="structure" className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Structure
                  </TabsTrigger>
                  <TabsTrigger value="seo" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    SEO
                  </TabsTrigger>
                  <TabsTrigger value="translate" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Translate
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="enhance" className="mt-6">
                  <ContentGenerator
                    type="enhancement"
                    onResult={handleGenerationResult}
                    title="Content Enhancement"
                    description="Improve existing text content with AI"
                  />
                </TabsContent>

                <TabsContent value="structure" className="mt-6">
                  <ContentGenerator
                    type="structure"
                    onResult={handleGenerationResult}
                    title="Structure Suggestions"
                    description="Get HTML and layout recommendations"
                  />
                </TabsContent>

                <TabsContent value="seo" className="mt-6">
                  <ContentGenerator
                    type="seo"
                    onResult={handleGenerationResult}
                    title="SEO Optimization"
                    description="Generate meta descriptions, titles, and keywords"
                  />
                </TabsContent>

                <TabsContent value="translate" className="mt-6">
                  <ContentGenerator
                    type="translation"
                    onResult={handleGenerationResult}
                    title="Multi-language Generation"
                    description="Generate content in different languages"
                  />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Prompt Builder & Results */}
          <div className="lg:col-span-1 space-y-6">
            <PromptBuilder activeGenerationType={activeTab} />
            
            {/* Generation History */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Generations</h3>
              
              {generationResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No content generated yet</p>
                  <p className="text-sm">Start generating to see results here</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {generationResults.map((result, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                          {result.type}
                        </span>
                        {result.language && (
                          <span className="text-xs text-muted-foreground">
                            {result.language}
                          </span>
                        )}
                      </div>
                      <p className="text-sm line-clamp-3">{result.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIContentStudio;