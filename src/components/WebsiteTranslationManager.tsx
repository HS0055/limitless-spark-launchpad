import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Globe, RefreshCcw, CheckCircle, AlertCircle, Languages, Eye, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TranslationStats {
  total_pages: number;
  total_texts: number;
  total_translations: number;
  languages_count: number;
  last_updated: string;
}

interface TranslationEntry {
  id: string;
  page_path: string;
  original_text: string;
  translated_text: string;
  target_language: string;
  updated_at: string;
  is_active: boolean;
}

const WebsiteTranslationManager = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<TranslationStats | null>(null);
  const [translations, setTranslations] = useState<TranslationEntry[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedPage, setSelectedPage] = useState('all');
  const { toast } = useToast();

  const languages = [
    { code: 'hy', name: 'Armenian', flag: '🇦🇲' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' }
  ];

  const pages = [
    { path: '/', name: 'Home' },
    { path: '/business-fundamentals', name: 'Business Fundamentals' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/admin', name: 'Admin Panel' },
    { path: '/community', name: 'Community' },
    { path: '/settings', name: 'Settings' },
    { path: '/league', name: 'League' },
    { path: '/python-tools', name: 'Python Tools' },
    { path: '/meme-coins', name: 'Meme Coins' },
    { path: '/visual-business', name: 'Visual Business' },
    { path: '/ai-tools', name: 'AI Tools' }
  ];

  useEffect(() => {
    loadStats();
    loadTranslations();
  }, []);

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('website_translations')
        .select('page_path, target_language, updated_at')
        .eq('is_active', true);

      if (error) throw error;

      if (data) {
        const uniquePages = new Set(data.map(t => t.page_path));
        const uniqueLanguages = new Set(data.map(t => t.target_language));
        const lastUpdated = data.reduce((latest, t) => 
          t.updated_at > latest ? t.updated_at : latest, data[0]?.updated_at || ''
        );

        setStats({
          total_pages: uniquePages.size,
          total_texts: data.length,
          total_translations: data.length,
          languages_count: uniqueLanguages.size,
          last_updated: lastUpdated
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadTranslations = async () => {
    try {
      let query = supabase
        .from('website_translations')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (selectedLanguage !== 'all') {
        query = query.eq('target_language', selectedLanguage);
      }

      if (selectedPage !== 'all') {
        query = query.eq('page_path', selectedPage);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      setTranslations(data || []);
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  };

  useEffect(() => {
    loadTranslations();
  }, [selectedLanguage, selectedPage]);

  const scanAndTranslateWebsite = async () => {
    setIsScanning(true);
    setProgress(0);

    try {
      const baseUrl = window.location.origin;
      
      toast({
        title: "🤖 Vision AI Scan Started",
        description: "Using AI vision to extract ALL visible content and translate...",
      });

      // Try Vision AI scan first
      const { data: visionData, error: visionError } = await supabase.functions.invoke('vision-ai-website-scan', {
        body: {
          baseUrl,
          targetLanguages: languages.map(l => l.code)
          // No pages parameter - will auto-discover all pages
        }
      });

      if (visionError) {
        console.error('Vision AI scan failed, falling back to standard scan:', visionError);
        
        // Fallback to standard scan
        const { data, error } = await supabase.functions.invoke('scan-and-translate-website', {
          body: {
            baseUrl,
            targetLanguages: languages.map(l => l.code),
            pages: pages.map(p => p.path)
          }
        });

        if (error) throw error;
        
        toast({
          title: "✅ Website Translation Complete (Standard)",
          description: `Translated ${data.summary.unique_texts_found} texts to ${data.summary.languages_translated} languages`,
        });
      } else {
        toast({
          title: "🎉 Vision AI Scan Complete!",
          description: `AI vision extracted ${visionData.summary.unique_texts_extracted} texts and translated to ${visionData.summary.languages_translated} languages`,
        });
      }

      setProgress(100);
      
      // Reload stats and translations
      await loadStats();
      await loadTranslations();

    } catch (error) {
      console.error('Failed to scan and translate website:', error);
      toast({
        title: "❌ Translation Failed",
        description: "Failed to scan and translate website. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const updateTranslation = async (id: string, newText: string) => {
    try {
      const { error } = await supabase
        .from('website_translations')
        .update({ translated_text: newText, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "✅ Translation Updated",
        description: "Translation has been updated successfully",
      });

      loadTranslations();
    } catch (error) {
      console.error('Failed to update translation:', error);
      toast({
        title: "❌ Update Failed",
        description: "Failed to update translation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Website Translation Manager
          </CardTitle>
          <CardDescription>
            🤖 Uses AI vision to extract ALL visible content from screenshots and translate to multiple languages.
            Perfect for capturing buttons, images with text, and dynamic content that HTML parsing might miss.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={scanAndTranslateWebsite}
              disabled={isScanning}
              className="flex-1"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Vision AI Scanning & Translating...
                </>
              ) : (
                <>
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  🤖 Vision AI Scan & Translate
                </>
              )}
            </Button>

            <Button 
              onClick={loadStats}
              variant="outline"
            >
              <Eye className="w-4 h-4 mr-2" />
              Refresh Stats
            </Button>
          </div>

          {isScanning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Translation Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.total_pages}</div>
                <div className="text-sm text-muted-foreground">Pages</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.total_translations}</div>
                <div className="text-sm text-muted-foreground">Translations</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.languages_count}</div>
                <div className="text-sm text-muted-foreground">Languages</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-xs font-bold text-orange-600">
                  {stats.last_updated ? new Date(stats.last_updated).toLocaleDateString() : 'Never'}
                </div>
                <div className="text-sm text-muted-foreground">Last Updated</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Translations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Translation Database
          </CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Filter by Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        {lang.flag} {lang.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Filter by Page</label>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pages</SelectItem>
                  {pages.map((page) => (
                    <SelectItem key={page.path} value={page.path}>
                      {page.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {translations.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Original Text</TableHead>
                    <TableHead>Translation</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {translations.map((translation) => (
                    <TableRow key={translation.id}>
                      <TableCell className="font-medium">
                        {pages.find(p => p.path === translation.page_path)?.name || translation.page_path}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {languages.find(l => l.code === translation.target_language)?.flag}
                          <span className="text-xs">
                            {languages.find(l => l.code === translation.target_language)?.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {translation.original_text}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {translation.translated_text}
                      </TableCell>
                      <TableCell>
                        <Badge variant={translation.is_active ? 'default' : 'secondary'}>
                          {translation.is_active ? (
                            <><CheckCircle className="w-3 h-3 mr-1" />Active</>
                          ) : (
                            <><AlertCircle className="w-3 h-3 mr-1" />Inactive</>
                          )}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Languages className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No translations found. Click "Scan & Translate" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WebsiteTranslationManager;