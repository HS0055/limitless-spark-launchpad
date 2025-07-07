import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, FileText, Globe, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  analysis: string;
  analysisType: string;
  url?: string;
  timestamp: string;
}

const AIContentAnalyzer = () => {
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [analysisType, setAnalysisType] = useState('translation_quality');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeContent = async () => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter content to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-analyzer', {
        body: {
          content: content.trim(),
          url: url.trim(),
          analysisType
        }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Analysis Complete",
        description: "Content has been analyzed successfully",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'translation_quality': return <Globe className="w-4 h-4" />;
      case 'content_structure': return <FileText className="w-4 h-4" />;
      case 'localization_strategy': return <Target className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            AI Content Analyzer
          </CardTitle>
          <CardDescription>
            Analyze web content for translation readiness and localization insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">URL (Optional)</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/page"
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Content to Analyze</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your web page content here..."
              rows={6}
              className="resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Analysis Type</label>
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="translation_quality">Translation Quality Assessment</SelectItem>
                <SelectItem value="content_structure">Content Structure Analysis</SelectItem>
                <SelectItem value="localization_strategy">Localization Strategy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={analyzeContent} 
            disabled={isAnalyzing || !content.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Analyze Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getAnalysisIcon(result.analysisType)}
              Analysis Results
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{result.analysisType.replace('_', ' ')}</Badge>
              <span className="text-sm text-muted-foreground">
                {new Date(result.timestamp).toLocaleString()}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {result.analysis}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIContentAnalyzer;