import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Globe, 
  Loader2, 
  Play, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Database,
  Languages,
  FileText,
  Eye
} from 'lucide-react';

interface ScrapingJob {
  id: string;
  url: string;
  status: string;
  pages_found: number;
  pages_scraped: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
  metadata: any;
}

interface ScrapedContent {
  id: string;
  url: string;
  title: string;
  content: string;
  scraped_at: string;
  metadata: any;
}

const availableLanguages = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

export const WebsiteScraper = () => {
  const [url, setUrl] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['es', 'fr', 'de']);
  const [maxPages, setMaxPages] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [scrapedContent, setScrapedContent] = useState<ScrapedContent[]>([]);
  const [activeTab, setActiveTab] = useState<'scraper' | 'jobs' | 'content'>('scraper');
  const { toast } = useToast();

  useEffect(() => {
    loadJobs();
    loadScrapedContent();
  }, []);

  // Auto-refresh active jobs every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const activeJobs = jobs.filter(job => job.status === 'processing');
      if (activeJobs.length > 0) {
        loadJobs();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [jobs]);

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('scraping_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const loadScrapedContent = async () => {
    try {
      const { data, error } = await supabase
        .from('scraped_content')
        .select('*')
        .eq('is_active', true)
        .order('scraped_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setScrapedContent(data || []);
    } catch (error) {
      console.error('Failed to load scraped content:', error);
    }
  };

  const startScraping = async () => {
    if (!url || selectedLanguages.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please provide a URL and select at least one target language.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('website-scraper-ai', {
        body: {
          action: 'scrape',
          url,
          targetLanguages: selectedLanguages,
          maxPages
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "🚀 Scraping Started",
          description: `Job created successfully! Scraping ${url} with AI translation to ${selectedLanguages.length} languages.`
        });
        
        setUrl('');
        loadJobs();
      } else {
        throw new Error(data.error || 'Failed to start scraping');
      }
    } catch (error) {
      console.error('Scraping failed:', error);
      toast({
        title: "❌ Scraping Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'processing': return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      default: return <RefreshCw className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleLanguage = (langCode: string) => {
    setSelectedLanguages(prev => 
      prev.includes(langCode) 
        ? prev.filter(l => l !== langCode)
        : [...prev, langCode]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            AI Website Scraper & Translator
          </CardTitle>
          <CardDescription>
            Scrape website content, extract text, and automatically translate to multiple languages using AI.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('scraper')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'scraper' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
          }`}
        >
          <Play className="w-4 h-4 inline mr-2" />
          New Scraping Job
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'jobs' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
          }`}
        >
          <Database className="w-4 h-4 inline mr-2" />
          Scraping Jobs
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'content' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Scraped Content
        </button>
      </div>

      {/* Scraper Tab */}
      {activeTab === 'scraper' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Start New Scraping Job
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* URL Input */}
            <div>
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Language Selection */}
            <div>
              <Label>Target Languages for Translation</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => toggleLanguage(lang.code)}
                    className={`p-2 rounded-md border text-sm font-medium transition-colors ${
                      selectedLanguages.includes(lang.code)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-muted border-border'
                    }`}
                  >
                    {lang.flag} {lang.name}
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {selectedLanguages.length} languages
              </p>
            </div>

            {/* Max Pages */}
            <div>
              <Label htmlFor="maxPages">Maximum Pages to Scrape</Label>
              <Select value={maxPages.toString()} onValueChange={(value) => setMaxPages(parseInt(value))}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 pages</SelectItem>
                  <SelectItem value="10">10 pages</SelectItem>
                  <SelectItem value="25">25 pages</SelectItem>
                  <SelectItem value="50">50 pages</SelectItem>
                  <SelectItem value="100">100 pages</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Button */}
            <Button 
              onClick={startScraping} 
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting Scraper...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start AI Scraping & Translation
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Scraping Jobs
            </CardTitle>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Recent scraping jobs and their status
              </p>
              <Button onClick={loadJobs} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <span className="font-medium">{job.url}</span>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(job.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    {job.status === 'processing' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{job.pages_scraped}/{job.pages_found || 'unknown'} pages</span>
                        </div>
                        <Progress 
                          value={job.pages_found ? (job.pages_scraped / job.pages_found) * 100 : 0} 
                          className="w-full" 
                        />
                      </div>
                    )}
                    
                    {job.status === 'completed' && (
                      <p className="text-sm text-green-600">
                        ✅ Completed: {job.pages_scraped} pages scraped and translated
                      </p>
                    )}
                    
                    {job.status === 'failed' && job.error_message && (
                      <p className="text-sm text-red-600">
                        ❌ Error: {job.error_message}
                      </p>
                    )}
                    
                    {job.metadata?.targetLanguages && (
                      <div className="flex gap-1 mt-2">
                        {job.metadata.targetLanguages.map((lang: string) => {
                          const langInfo = availableLanguages.find(l => l.code === lang);
                          return langInfo ? (
                            <Badge key={lang} variant="secondary" className="text-xs">
                              {langInfo.flag} {langInfo.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No scraping jobs found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Scraped Content
            </CardTitle>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Content extracted from websites
              </p>
              <Button onClick={loadScrapedContent} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {scrapedContent.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Content Preview</TableHead>
                    <TableHead>Scraped At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scrapedContent.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell className="font-mono text-xs max-w-xs truncate">
                        <a 
                          href={content.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {content.url}
                        </a>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {content.title || 'No title'}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="text-sm text-muted-foreground truncate">
                          {content.content.substring(0, 100)}...
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(content.scraped_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No scraped content found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};