import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Eye, 
  EyeOff, 
  Target, 
  Scan, 
  Zap, 
  Filter,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Clock,
  Globe,
  Code,
  Type,
  Image,
  MousePointer,
  Hash,
  Languages,
  Sparkles,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { contentDetector, DetectedContent, ContentType } from '@/lib/contentDetector';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/contexts/TranslationContext';
import { useSeamlessTranslation } from '@/hooks/useSeamlessTranslation';
import { supabase } from '@/integrations/supabase/client';
import PublicLayout from '@/components/PublicLayout';

const ContentDetector: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [detectedContent, setDetectedContent] = useState<DetectedContent[]>([]);
  const [filteredContent, setFilteredContent] = useState<DetectedContent[]>([]);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [scanOptions, setScanOptions] = useState({
    includeHidden: false,
    watchChanges: true,
    prioritizeVisible: true
  });
  const [filters, setFilters] = useState({
    contentType: 'all' as ContentType | 'all',
    minPriority: 0,
    visible: 'all' as 'all' | 'visible' | 'hidden',
    searchText: ''
  });
  const [scanProgress, setScanProgress] = useState(0);
  const [translatedItems, setTranslatedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { currentLanguage, availableLanguages } = useTranslation();
  const { translatePage, isTranslating: seamlessTranslating, progress: seamlessProgress } = useSeamlessTranslation();

  // Auto-translate and update whole website
  const handleAutoTranslateWebsite = async () => {
    if (!targetLanguage || targetLanguage === 'en') {
      toast({
        title: "⚠️ Select Target Language",
        description: "Please select a language other than English to translate to",
        variant: "destructive",
      });
      return;
    }

    setIsTranslating(true);
    setTranslationProgress(0);
    
    try {
      toast({
        title: "🌍 Auto-Translating Website",
        description: "Scanning and translating all content on the website...",
      });

      // Step 1: Detect all content (25% progress)
      const progressInterval = setInterval(() => {
        setTranslationProgress(prev => Math.min(prev + 5, 25));
      }, 100);

      const results = await contentDetector.detectAllContent({
        includeHidden: true,
        watchChanges: false,
        prioritizeVisible: true
      });
      
      clearInterval(progressInterval);
      setTranslationProgress(30);
      setDetectedContent(results);
      setFilteredContent(results);

      // Step 2: Use seamless translation for whole page (50% progress)
      setTranslationProgress(40);
      await translatePage(targetLanguage);
      setTranslationProgress(70);

      // Step 3: Batch translate detected content and store in database
      const untranslatedContent = results.filter(item => 
        item.originalText.trim().length > 0 && 
        !/^[a-f0-9-]{8,}$/i.test(item.originalText) // Skip IDs
      );

      if (untranslatedContent.length > 0) {
        await batchTranslateAndStore(untranslatedContent, targetLanguage);
      }
      
      setTranslationProgress(100);
      
      toast({
        title: "✅ Website Translation Complete",
        description: `Successfully translated ${results.length} content items to ${availableLanguages.find(l => l.code === targetLanguage)?.name}`,
      });

      // Show translated items
      setTranslatedItems(new Set(results.map(item => item.id)));

    } catch (error) {
      console.error('Auto-translation failed:', error);
      toast({
        title: "❌ Translation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
      setTimeout(() => setTranslationProgress(0), 3000);
    }
  };

  // Batch translate content and store in database
  const batchTranslateAndStore = async (content: DetectedContent[], targetLang: string) => {
    const batchSize = 20;
    const batches: DetectedContent[][] = [];
    
    for (let i = 0; i < content.length; i += batchSize) {
      batches.push(content.slice(i, i + batchSize));
    }

    for (const [index, batch] of batches.entries()) {
      try {
        // Extract texts for translation
        const textsToTranslate = batch.map(item => item.originalText);
        
        // Call AI translation service
        const { data, error } = await supabase.functions.invoke('ai-translate', {
          body: {
            texts: textsToTranslate,
            targetLanguage: targetLang,
            context: 'website_content'
          }
        });

        if (error) throw error;
        
        // Store translations in database
        const translations = data.translations;
        const translationRecords = batch.map((item, idx) => ({
          original_text: item.originalText,
          translated_text: translations[idx] || item.originalText,
          target_language: targetLang,
          page_path: window.location.pathname,
          source_language: 'en',
          is_active: true
        }));

        await supabase
          .from('website_translations')
          .upsert(translationRecords, {
            onConflict: 'original_text,target_language,page_path'
          });

        // Update progress
        setTranslationProgress(70 + (index + 1) / batches.length * 25);
        
      } catch (error) {
        console.error(`Batch ${index} translation failed:`, error);
      }
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    try {
      toast({
        title: "🔍 Starting Content Detection",
        description: "Scanning page for translatable content...",
      });

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setScanProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const results = await contentDetector.detectAllContent(scanOptions);
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      setDetectedContent(results);
      setFilteredContent(results);
      
      toast({
        title: "✅ Scan Complete",
        description: `Found ${results.length} translatable content items`,
      });
    } catch (error) {
      console.error('Scan failed:', error);
      toast({
        title: "❌ Scan Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanProgress(0), 2000);
    }
  };

  // Apply filters whenever filters or detectedContent changes
  useEffect(() => {
    let filtered = [...detectedContent];

    // Filter by content type
    if (filters.contentType !== 'all') {
      filtered = filtered.filter(item => item.contentType === filters.contentType);
    }

    // Filter by priority
    filtered = filtered.filter(item => item.priority >= filters.minPriority);

    // Filter by visibility
    if (filters.visible === 'visible') {
      filtered = filtered.filter(item => item.isVisible);
    } else if (filters.visible === 'hidden') {
      filtered = filtered.filter(item => !item.isVisible);
    }

    // Filter by search text
    if (filters.searchText.trim()) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(item => 
        item.originalText.toLowerCase().includes(searchLower) ||
        item.contentType.toLowerCase().includes(searchLower) ||
        item.context.component?.toLowerCase().includes(searchLower) ||
        item.context.section?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredContent(filtered);
  }, [filters, detectedContent]);

  const getContentTypeIcon = (type: ContentType) => {
    const iconMap = {
      text: Type,
      heading: Hash,
      button: MousePointer,
      link: MousePointer,
      label: Type,
      placeholder: Type,
      alt: Image,
      title: Type,
      'aria-label': Type,
      option: Type,
      meta: Code,
      tooltip: Type,
      notification: AlertCircle
    };
    
    const Icon = iconMap[type] || Type;
    return <Icon className="w-4 h-4" />;
  };

  const getContentTypeColor = (type: ContentType) => {
    const colorMap = {
      heading: 'text-blue-500',
      button: 'text-green-500',
      link: 'text-purple-500',
      text: 'text-gray-500',
      placeholder: 'text-orange-500',
      alt: 'text-pink-500',
      meta: 'text-indigo-500',
      notification: 'text-red-500'
    };
    
    return colorMap[type] || 'text-gray-500';
  };

  const contentTypes = [
    'all', 'text', 'heading', 'button', 'link', 'label', 
    'placeholder', 'alt', 'title', 'aria-label', 'option', 'meta', 'tooltip', 'notification'
  ];

  const stats = {
    total: detectedContent.length,
    visible: detectedContent.filter(item => item.isVisible).length,
    highPriority: detectedContent.filter(item => item.priority >= 8).length,
    byType: detectedContent.reduce((acc, item) => {
      acc[item.contentType] = (acc[item.contentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <PublicLayout 
      sectionName="Content Detection Engine" 
      sectionIcon={Scan}
      sectionColor="from-green-500 to-blue-500"
    >
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-black mb-6">
              Advanced <span className="text-gradient bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">Content Detection</span> Engine
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Intelligently scan and identify all translatable content on any page or dashboard with AI-powered analysis
            </p>
          </div>

          {/* Auto-Translation Section */}
          <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Auto-Translate Entire Website
              </CardTitle>
              <p className="text-muted-foreground">
                Automatically detect, translate, and update all content on your website in one click
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="targetLanguage">Target Language</Label>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLanguages.filter(lang => lang.code !== 'en').map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button 
                      onClick={handleAutoTranslateWebsite}
                      disabled={isTranslating || !targetLanguage}
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold px-8 py-4 text-lg"
                    >
                      {isTranslating ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Translating Website...
                        </>
                      ) : (
                        <>
                          <Globe className="w-5 h-5 mr-2" />
                          Auto-Translate Website
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {(isTranslating || translationProgress > 0) && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Translation Progress</span>
                        <span>{translationProgress}%</span>
                      </div>
                      <Progress value={translationProgress} className="w-full h-3" />
                      <div className="text-xs text-muted-foreground">
                        {translationProgress <= 30 && "🔍 Detecting content..."}
                        {translationProgress > 30 && translationProgress <= 70 && "🌍 Translating website..."}
                        {translationProgress > 70 && "💾 Storing translations..."}
                        {translationProgress === 100 && "✅ Translation complete!"}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Detects all content automatically
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Translates with AI-powered accuracy
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Updates entire website instantly
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Stores translations for future use
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Scan Controls */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Manual Detection Controls
              </CardTitle>
              <p className="text-muted-foreground">
                Fine-tune content detection and view detailed analysis
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Scan Options</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="includeHidden">Include Hidden Elements</Label>
                      <Switch
                        id="includeHidden"
                        checked={scanOptions.includeHidden}
                        onCheckedChange={(checked) => 
                          setScanOptions(prev => ({ ...prev, includeHidden: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="watchChanges">Watch for Changes</Label>
                      <Switch
                        id="watchChanges"
                        checked={scanOptions.watchChanges}
                        onCheckedChange={(checked) => 
                          setScanOptions(prev => ({ ...prev, watchChanges: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="prioritizeVisible">Prioritize Visible</Label>
                      <Switch
                        id="prioritizeVisible"
                        checked={scanOptions.prioritizeVisible}
                        onCheckedChange={(checked) => 
                          setScanOptions(prev => ({ ...prev, prioritizeVisible: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button 
                      onClick={handleScan}
                      disabled={isScanning}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-8 py-3"
                    >
                      {isScanning ? (
                        <>
                          <Scan className="w-5 h-5 mr-2 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Start Detection
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {scanProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Detection Progress</span>
                        <span>{scanProgress}%</span>
                      </div>
                      <Progress value={scanProgress} className="w-full" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          {detectedContent.length > 0 && (
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-primary mb-2">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Items</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-green-500 mb-2">{stats.visible}</div>
                <div className="text-sm text-muted-foreground">Visible Items</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-blue-500 mb-2">{stats.highPriority}</div>
                <div className="text-sm text-muted-foreground">High Priority</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-purple-500 mb-2">{Object.keys(stats.byType).length}</div>
                <div className="text-sm text-muted-foreground">Content Types</div>
              </Card>
            </div>
          )}

          {/* Content Results */}
          {detectedContent.length > 0 && (
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Content Items</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="types">By Type</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6">
                {/* Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="searchText">Search Text</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="searchText"
                            placeholder="Search content..."
                            value={filters.searchText}
                            onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="contentType">Content Type</Label>
                        <select
                          id="contentType"
                          value={filters.contentType}
                          onChange={(e) => setFilters(prev => ({ ...prev, contentType: e.target.value as ContentType | 'all' }))}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          {contentTypes.map(type => (
                            <option key={type} value={type}>
                              {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="visibility">Visibility</Label>
                        <select
                          id="visibility"
                          value={filters.visible}
                          onChange={(e) => setFilters(prev => ({ ...prev, visible: e.target.value as 'all' | 'visible' | 'hidden' }))}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="all">All Items</option>
                          <option value="visible">Visible Only</option>
                          <option value="hidden">Hidden Only</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="priority">Min Priority</Label>
                        <Input
                          id="priority"
                          type="number"
                          min="0"
                          max="20"
                          value={filters.minPriority}
                          onChange={(e) => setFilters(prev => ({ ...prev, minPriority: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Results Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Detected Content ({filteredContent.length} of {detectedContent.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Content</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Visible</TableHead>
                            <TableHead>Context</TableHead>
                            <TableHead>Complexity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredContent.slice(0, 50).map((item, index) => (
                            <TableRow key={index}>
                          <TableCell className="max-w-xs">
                            <div className="flex items-center gap-2">
                              <div className="truncate font-mono text-sm">
                                {item.originalText}
                              </div>
                              {translatedItems.has(item.id) && (
                                <Badge variant="default" className="bg-green-500/10 text-green-600">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Translated
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.metadata.wordCount} words
                            </div>
                          </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <span className={getContentTypeColor(item.contentType)}>
                                    {getContentTypeIcon(item.contentType)}
                                  </span>
                                  {item.contentType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-semibold">{item.priority}</div>
                                  <Progress value={(item.priority / 20) * 100} className="w-16 h-2" />
                                </div>
                              </TableCell>
                              <TableCell>
                                {item.isVisible ? (
                                  <Badge variant="default" className="bg-green-500/10 text-green-600">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Visible
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    <EyeOff className="w-3 h-3 mr-1" />
                                    Hidden
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {item.context.component && (
                                    <div className="text-blue-500">{item.context.component}</div>
                                  )}
                                  {item.context.section && (
                                    <div className="text-muted-foreground">{item.context.section}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    item.metadata.complexity === 'simple' ? 'default' :
                                    item.metadata.complexity === 'medium' ? 'secondary' : 
                                    'destructive'
                                  }
                                >
                                  {item.metadata.complexity}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {filteredContent.length > 50 && (
                      <div className="mt-4 text-center text-muted-foreground">
                        Showing first 50 of {filteredContent.length} results
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Content Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(stats.byType).map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={getContentTypeColor(type as ContentType)}>
                                {getContentTypeIcon(type as ContentType)}
                              </span>
                              <span className="capitalize">{type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-semibold">{count}</div>
                              <div className="w-20 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: `${(count / stats.total) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quality Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Visibility Rate</span>
                          <span className="font-semibold">{((stats.visible / stats.total) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>High Priority Items</span>
                          <span className="font-semibold">{stats.highPriority}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Content Types</span>
                          <span className="font-semibold">{Object.keys(stats.byType).length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Avg Words per Item</span>
                          <span className="font-semibold">
                            {(detectedContent.reduce((sum, item) => sum + item.metadata.wordCount, 0) / detectedContent.length).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="types" className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <Card key={type} className="text-center p-6">
                      <div className={`text-4xl mb-3 ${getContentTypeColor(type as ContentType)}`}>
                        {getContentTypeIcon(type as ContentType)}
                      </div>
                      <div className="text-2xl font-bold mb-1">{count}</div>
                      <div className="text-sm text-muted-foreground capitalize">{type}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {((count / stats.total) * 100).toFixed(1)}% of total
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* No Results State */}
          {detectedContent.length === 0 && !isScanning && !isTranslating && (
            <Card className="text-center p-12">
              <div className="space-y-6">
                <Scan className="w-20 h-20 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-2xl font-semibold mb-3">Ready to Transform Your Website</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Use our advanced AI-powered system to automatically detect and translate all content on your website
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Button 
                    onClick={handleAutoTranslateWebsite} 
                    disabled={!targetLanguage}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold px-8 py-4 text-lg"
                  >
                    <Globe className="w-5 h-5 mr-2" />
                    Auto-Translate Website
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    Or use manual controls below for detailed analysis
                  </div>
                  
                  <Button onClick={handleScan} variant="outline">
                    <Scan className="w-4 h-4 mr-2" />
                    Manual Content Detection
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default ContentDetector;