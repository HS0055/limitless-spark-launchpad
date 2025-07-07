import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { 
  Image as ImageIcon, 
  Loader2, 
  Download, 
  Copy, 
  Sparkles,
  Wand2,
  Palette
} from 'lucide-react';

interface AIImageGeneratorProps {
  className?: string;
  variant?: 'default' | 'compact' | 'inline';
  onImageGenerated?: (imageUrl: string, prompt: string) => void;
}

const AIImageGenerator = ({ 
  className = '', 
  variant = 'default',
  onImageGenerated 
}: AIImageGeneratorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [revisedPrompt, setRevisedPrompt] = useState<string>('');

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required", 
        description: "Please enter a description for the image",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate images",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('https://a048e3e6-89eb-49f4-9bfe-b3a6341ee7d3.supabase.co/functions/v1/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          size: "1024x1024", 
          quality: "high"
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
      
      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      setRevisedPrompt(data.revisedPrompt || prompt);
      
      if (onImageGenerated) {
        onImageGenerated(data.imageUrl, data.revisedPrompt || prompt);
      }
      
      toast({
        title: "Image Generated!",
        description: "Your AI-generated image is ready",
      });
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Downloaded",
      description: "Image has been downloaded to your device",
    });
  };

  const copyImageUrl = async () => {
    if (!generatedImage) return;
    
    try {
      await navigator.clipboard.writeText(generatedImage);
      toast({
        title: "Copied",
        description: "Image URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy image URL",
        variant: "destructive"
      });
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex gap-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="flex-1 min-h-[60px]"
            maxLength={4000}
          />
          <Button 
            onClick={generateImage} 
            disabled={isGenerating || !prompt.trim()}
            className="btn-hero px-4"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {generatedImage && (
          <div className="relative group">
            <img 
              src={generatedImage} 
              alt={revisedPrompt}
              className="w-full rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <Button size="sm" variant="secondary" onClick={downloadImage}>
                  <Download className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="secondary" onClick={copyImageUrl}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Generate image..."
          className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          maxLength={1000}
        />
        <Button 
          size="sm" 
          onClick={generateImage} 
          disabled={isGenerating || !prompt.trim()}
          className="btn-hero"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className={`card-elevated ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            AI Image Generator
          </CardTitle>
          <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent-secondary/10">
            GPT-Image-1
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Describe your image
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic city skyline at sunset with flying cars and neon lights..."
            className="min-h-[120px] resize-none"
            maxLength={4000}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">
              {prompt.length}/4000 characters
            </span>
            {!user && (
              <Badge variant="outline" className="text-xs">
                Sign in required
              </Badge>
            )}
          </div>
        </div>

        <Button
          onClick={generateImage}
          disabled={isGenerating || !prompt.trim() || !user}
          className="w-full btn-hero"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Image
            </>
          )}
        </Button>

        {generatedImage && (
          <div className="space-y-4">
            <div className="relative group">
              <img 
                src={generatedImage} 
                alt={revisedPrompt}
                className="w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl" />
            </div>
            
            {revisedPrompt !== prompt && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-1">Revised Prompt:</p>
                <p className="text-sm text-muted-foreground">{revisedPrompt}</p>
              </div>
            )}
            
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={downloadImage} className="hover-glow">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={copyImageUrl} className="hover-glow">
                <Copy className="w-4 h-4 mr-2" />
                Copy URL
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIImageGenerator;