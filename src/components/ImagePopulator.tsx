import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Image, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GeneratedImage {
  key: string;
  imageUrl?: string;
  error?: string;
  success: boolean;
}

export const ImagePopulator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedImage[]>([]);

  const populateImages = async () => {
    setIsGenerating(true);
    setResults([]);
    
    try {
      toast.info('Generating professional images for website...');
      
      const { data, error } = await supabase.functions.invoke('populate-website-images', {
        body: {}
      });

      if (error) throw error;

      if (data.success) {
        setResults(data.results);
        toast.success(`Generated ${data.successful}/${data.total} images successfully!`);
      } else {
        throw new Error('Failed to generate images');
      }
    } catch (error) {
      console.error('Error generating images:', error);
      toast.error('Failed to generate images. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSingleImage = async (imageKey: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('populate-website-images', {
        body: { imageKey }
      });

      if (error) throw error;

      if (data.success) {
        // Update specific result
        setResults(prev => prev.map(r => 
          r.key === imageKey 
            ? { key: imageKey, imageUrl: data.imageUrl, success: true }
            : r
        ));
        toast.success(`Regenerated ${imageKey} image`);
      }
    } catch (error) {
      toast.error(`Failed to regenerate ${imageKey}`);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">Website Image Generator</h3>
          <p className="text-muted-foreground mb-4">
            Generate professional business images for your website content
          </p>
          
          <Button 
            onClick={populateImages}
            disabled={isGenerating}
            className="btn-hero"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Images...
              </>
            ) : (
              <>
                <Image className="w-5 h-5 mr-2" />
                Generate All Website Images
              </>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Generated Images:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((result) => (
                <Card key={result.key} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium capitalize">{result.key.replace('-', ' ')}</h5>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateSingleImage(result.key)}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {result.success && result.imageUrl ? (
                    <div className="space-y-2">
                      <img 
                        src={result.imageUrl} 
                        alt={result.key}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <p className="text-xs text-green-600">✓ Generated successfully</p>
                    </div>
                  ) : (
                    <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-xs text-red-600">
                        {result.error || 'Failed to generate'}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};