import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Copy, Download } from 'lucide-react';

interface ContentGeneratorProps {
  type: 'enhancement' | 'structure' | 'seo' | 'translation';
  onResult: (result: { content: string; type: string; language?: string }) => void;
  title: string;
  description: string;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
];

export const ContentGenerator: React.FC<ContentGeneratorProps> = ({
  type,
  onResult,
  title,
  description
}) => {
  const [input, setInput] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [tone, setTone] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast({
        title: "Input required",
        description: "Please provide content to work with",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-web-content', {
        body: {
          content: input,
          type,
          targetLanguage: type === 'translation' ? targetLanguage : undefined,
          tone,
        },
      });

      if (error) throw error;

      const generatedContent = data.content;
      setResult(generatedContent);
      
      onResult({
        content: generatedContent,
        type: title,
        language: type === 'translation' ? languages.find(l => l.code === targetLanguage)?.name : undefined
      });

      toast({
        title: "Content generated",
        description: "AI has successfully generated your content",
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast({
      title: "Copied",
      description: "Content copied to clipboard",
    });
  };

  const downloadContent = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-content.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="content-input">
            {type === 'structure' ? 'HTML Content or Description' : 'Content to Process'}
          </Label>
          <Textarea
            id="content-input"
            placeholder={
              type === 'enhancement' ? 'Enter text content to improve...' :
              type === 'structure' ? 'Enter HTML or describe the structure you want...' :
              type === 'seo' ? 'Enter page content or topic for SEO optimization...' :
              'Enter content to translate...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {type === 'translation' && (
            <div>
              <Label htmlFor="target-language">Target Language</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {type !== 'structure' && (
            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !input.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            `Generate ${title}`
          )}
        </Button>
      </div>

      {result && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Generated Content</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={downloadContent}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="bg-muted/50 p-3 rounded border max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        </Card>
      )}
    </div>
  );
};