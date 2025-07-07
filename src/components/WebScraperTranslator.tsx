import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';
import { Globe, ExternalLink, Image, Link, FileText, Loader2, Download, Copy, Languages } from 'lucide-react';

interface TranslationResult {
  success: boolean;
  url: string;
  targetLanguage: string;
  original: {
    title: string;
    metaDescription: string;
    content: string;
    links: string[];
    images: string[];
  };
  translated: {
    title: string;
    metaDescription: string;
    content: string;
  };
  stats: {
    originalLength: number;
    translatedLength: number;
    linksFound: number;
    imagesFound: number;
  };
}

const languages = [
  { code: 'hy', name: 'Armenian', flag: '🇦🇲' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

export const WebScraperTranslator = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [targetLang, setTargetLang] = useState('hy');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);

  const handleScrapeAndTranslate = async () => {
    if (!url.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid URL',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.invoke('web-scraper-translate', {
        body: {
          url: url.trim(),
          targetLang,
          includeMeta: true,
          preserveHtml: false
        }
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setResult(response.data);
      
      toast({
        title: 'Success!',
        description: `Website scraped and translated to ${languages.find(l => l.code === targetLang)?.name}`,
      });
    } catch (error) {
      console.error('Scraping error:', error);
      toast({
        title: 'Error',
        description: 'Failed to scrape and translate website. Please check the URL and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Content copied to clipboard',
    });
  };

  const downloadAsText = () => {
    if (!result) return;
    
    const content = `
TRANSLATED WEBSITE CONTENT

Original URL: ${result.url}
Target Language: ${languages.find(l => l.code === result.targetLanguage)?.name}
Translation Date: ${new Date().toLocaleString()}

TITLE:
${result.translated.title}

META DESCRIPTION:
${result.translated.metaDescription}

CONTENT:
${result.translated.content}

STATISTICS:
- Original Length: ${result.stats.originalLength} characters
- Translated Length: ${result.stats.translatedLength} characters
- Links Found: ${result.stats.linksFound}
- Images Found: ${result.stats.imagesFound}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translated-${new URL(result.url).hostname}-${result.targetLanguage}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Globe className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-gradient">Web Translator</h1>
        </div>
        <p className="text-muted-foreground">
          Scrape any website and get instant translations with AI-powered accuracy
        </p>
      </div>

      {/* Input Form */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Translate Website
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full"
                disabled={isLoading}
              />
            </div>
            <Select value={targetLang} onValueChange={setTargetLang} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleScrapeAndTranslate} 
            disabled={isLoading || !url.trim()}
            className="w-full btn-hero"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scraping & Translating...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Scrape & Translate
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Stats */}
          <Card className="card-glass">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{result.stats.originalLength}</div>
                  <div className="text-xs text-muted-foreground">Original Chars</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent-secondary">{result.stats.translatedLength}</div>
                  <div className="text-xs text-muted-foreground">Translated Chars</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent-tertiary">{result.stats.linksFound}</div>
                  <div className="text-xs text-muted-foreground">Links Found</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{result.stats.imagesFound}</div>
                  <div className="text-xs text-muted-foreground">Images Found</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Website Info */}
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Website Information
                </CardTitle>
                <p className="text-sm text-muted-foreground">{result.url}</p>
              </div>
              <Badge variant="secondary">
                {languages.find(l => l.code === result.targetLanguage)?.flag} {' '}
                {languages.find(l => l.code === result.targetLanguage)?.name}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(result.translated.content)}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadAsText}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Translated Content */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Original */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-lg">Original Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Title</h4>
                  <p className="text-sm">{result.original.title}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Description</h4>
                  <p className="text-sm">{result.original.metaDescription}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Content Preview</h4>
                  <p className="text-xs text-muted-foreground line-clamp-6">{result.original.content}</p>
                </div>
              </CardContent>
            </Card>

            {/* Translated */}
            <Card className="card-elevated border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg text-gradient">Translated Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Title</h4>
                  <p className="text-sm font-medium">{result.translated.title}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Description</h4>
                  <p className="text-sm">{result.translated.metaDescription}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Content</h4>
                  <div className="max-h-64 overflow-y-auto bg-muted/30 rounded-lg p-3">
                    <p className="text-sm whitespace-pre-wrap">{result.translated.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          {(result.original.links.length > 0 || result.original.images.length > 0) && (
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-lg">Extracted Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.original.links.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <Link className="w-4 h-4" />
                      Links Found ({result.original.links.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {result.original.links.slice(0, 10).map((link, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {new URL(link, result.url).hostname}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {result.original.images.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <Image className="w-4 h-4" />
                      Images Found ({result.original.images.length})
                    </h4>
                    <div className="text-xs text-muted-foreground">
                      {result.original.images.length} images detected on the page
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};