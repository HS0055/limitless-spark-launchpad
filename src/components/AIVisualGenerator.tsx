import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AIVisualGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for your visual');
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt: `Professional business concept visualization: ${prompt}. Modern, clean, professional style with business aesthetics` 
        }
      });

      if (error) throw error;

      if (data.success && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast.success('Visual generated successfully!');
      } else {
        throw new Error('Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate visual. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isGenerating) {
      generateImage();
    }
  };

  return (
    <Card className="bg-gradient-to-br from-card via-card/80 to-card/60 backdrop-blur-xl border border-border/30 shadow-2xl">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="ml-4 text-sm font-mono text-muted-foreground">AI Visual Generator</span>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <Input
              placeholder="Describe your business concept (e.g., 'market growth strategy', 'team collaboration')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-muted/30 border-border/20"
              disabled={isGenerating}
            />
            
            <Button 
              onClick={generateImage}
              disabled={isGenerating || !prompt.trim()}
              className="w-full btn-hero"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Visual...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Visual
                </>
              )}
            </Button>
          </div>
          
          <div className="h-64 bg-gradient-to-br from-primary/10 to-accent-secondary/10 rounded-xl flex items-center justify-center border border-border/30 overflow-hidden">
            {generatedImage ? (
              <img 
                src={generatedImage} 
                alt="AI Generated Visual" 
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent-secondary rounded-full animate-pulse flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {isGenerating ? 'Creating your visual...' : 'Enter a description above to generate'}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};