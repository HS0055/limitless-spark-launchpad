import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HTMLAnalyzer } from '@/components/web-editor/HTMLAnalyzer';
import { ComponentTree } from '@/components/web-editor/ComponentTree';
import { ElementEditor } from '@/components/web-editor/ElementEditor';
import { useWebContentAnalysis } from '@/hooks/useWebContentAnalysis';
import { Upload, Code, Link, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ParsedComponent {
  id: string;
  tagName: string;
  textContent: string;
  attributes: Record<string, string>;
  children: ParsedComponent[];
  depth: number;
}

const WebEditor = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [inputMethod, setInputMethod] = useState<'upload' | 'paste' | 'url'>('paste');
  const [urlInput, setUrlInput] = useState<string>('');
  const [selectedComponent, setSelectedComponent] = useState<ParsedComponent | null>(null);
  const { toast } = useToast();

  const { parsedComponents, isAnalyzing, analyzeHTML } = useWebContentAnalysis();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/html') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setHtmlContent(content);
        analyzeHTML(content);
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload an HTML file.",
        variant: "destructive",
      });
    }
  };

  const handlePasteHTML = () => {
    if (htmlContent.trim()) {
      analyzeHTML(htmlContent);
      toast({
        title: "HTML Analyzed",
        description: "Successfully parsed HTML content.",
      });
    } else {
      toast({
        title: "No content",
        description: "Please paste HTML content first.",
        variant: "destructive",
      });
    }
  };

  const handleUrlFetch = async () => {
    if (!urlInput.trim()) {
      toast({
        title: "No URL provided",
        description: "Please enter a URL to fetch.",
        variant: "destructive",
      });
      return;
    }

    try {
      // For now, we'll show a placeholder message
      // In a real implementation, this would call a Supabase Edge Function
      toast({
        title: "URL Fetching",
        description: "URL fetching will be implemented in Phase 2 with CORS handling.",
      });
    } catch (error) {
      toast({
        title: "Fetch Error",
        description: "Failed to fetch content from URL.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Web Content Editor
          </h1>
          <p className="text-muted-foreground mt-2">
            Analyze, edit, and enhance web content with AI-powered tools
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Content Input</h2>
              
              <Tabs value={inputMethod} onValueChange={(value) => setInputMethod(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="paste" className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Paste
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    URL
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="paste" className="space-y-4">
                  <Textarea
                    placeholder="Paste your HTML content here..."
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <Button 
                    onClick={handlePasteHTML}
                    disabled={isAnalyzing || !htmlContent.trim()}
                    className="w-full"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze HTML'}
                  </Button>
                </TabsContent>

                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload an HTML file to analyze
                    </p>
                    <input
                      type="file"
                      accept=".html"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="html-upload"
                    />
                    <label htmlFor="html-upload">
                      <Button variant="outline" className="cursor-pointer">
                        Choose File
                      </Button>
                    </label>
                  </div>
                </TabsContent>

                <TabsContent value="url" className="space-y-4">
                  <Input
                    placeholder="https://example.com"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                  <Button 
                    onClick={handleUrlFetch}
                    disabled={isAnalyzing || !urlInput.trim()}
                    className="w-full"
                  >
                    Fetch Content
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Note: URL fetching requires server-side implementation to handle CORS
                  </p>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Analysis Section */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Component Structure</h2>
              
              {parsedComponents.length > 0 ? (
                <ComponentTree 
                  components={parsedComponents}
                  onSelectComponent={setSelectedComponent}
                  selectedComponent={selectedComponent}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Code className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No HTML content analyzed yet</p>
                  <p className="text-sm">Upload or paste HTML to see the component structure</p>
                </div>
              )}
            </Card>
          </div>

          {/* Editor Section */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Element Editor</h2>
              
              {selectedComponent ? (
                <ElementEditor 
                  component={selectedComponent}
                  onUpdateComponent={(updated) => {
                    setSelectedComponent(updated);
                    // TODO: Update the component in the parsed tree
                  }}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No component selected</p>
                  <p className="text-sm">Select a component from the structure tree to edit</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* HTML Analyzer */}
        {htmlContent && (
          <div className="mt-6">
            <HTMLAnalyzer htmlContent={htmlContent} />
          </div>
        )}
      </div>
    </div>
  );
};

export default WebEditor;