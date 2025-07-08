import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAITranslation } from '@/hooks/useAITranslation';
import { useToast } from '@/hooks/use-toast';
import { Brain, Wand2, Search, Sparkles, Target, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

const AITranslationDashboard = () => {
  const { translateWithAI, analyzeContent, optimizeTranslations, loading } = useAITranslation();
  const { toast } = useToast();
  const { translate, availableLanguages } = useTranslation();

  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [textToTranslate, setTextToTranslate] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [translationResult, setTranslationResult] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  const handleSmartTranslate = async () => {
    if (!textToTranslate.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to translate",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await translateWithAI({
        text: textToTranslate,
        targetLanguage: selectedLanguage,
        context: "Website content",
        pagePath: window.location.pathname
      });

      setTranslationResult(result);
      toast({
        title: "Translation Complete",
        description: `Text translated to ${selectedLanguage} with AI`,
      });
    } catch (error) {
      toast({
        title: "Translation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleContentAnalysis = async () => {
    if (!htmlContent.trim()) {
      // Use current page content if no HTML provided
      const pageContent = document.documentElement.outerHTML;
      setHtmlContent(pageContent);
    }

    try {
      const result = await analyzeContent({
        htmlContent: htmlContent || document.documentElement.outerHTML,
        pagePath: window.location.pathname,
        targetLanguages: [selectedLanguage]
      });

      setAnalysisResult(result);
      toast({
        title: "Content Analysis Complete",
        description: `Found ${result.detectedTexts} translatable texts, ${result.missingTranslations} missing translations`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleOptimization = async (mode: 'analyze' | 'consistency-check') => {
    try {
      const result = await optimizeTranslations(mode, { 
        language: selectedLanguage,
        limit: 50 
      });

      setOptimizationResult(result);
      toast({
        title: "Optimization Complete",
        description: mode === 'analyze' 
          ? `Found ${result.improvements?.length || 0} potential improvements`
          : `Found ${result.inconsistencies?.length || 0} terminology inconsistencies`,
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Brain className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">AI Translation Dashboard</h2>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {availableLanguages
              .filter(lang => lang.code !== 'en')
              .map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="translate" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="translate" className="flex items-center space-x-2">
            <Wand2 className="w-4 h-4" />
            <span>Smart Translate</span>
          </TabsTrigger>
          <TabsTrigger value="analyze" className="flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span>Content Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="optimize" className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Optimization</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="translate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wand2 className="w-5 h-5" />
                <span>AI-Powered Smart Translation</span>
              </CardTitle>
              <CardDescription>
                Translate text with context-aware AI that understands your brand and audience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter text to translate..."
                value={textToTranslate}
                onChange={(e) => setTextToTranslate(e.target.value)}
                rows={4}
              />
              <Button 
                onClick={handleSmartTranslate} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Translate with AI
                  </>
                )}
              </Button>

              {translationResult && (
                <Card className="mt-4">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Translation Result</h4>
                        <div className="flex space-x-2">
                          {translationResult.cached && (
                            <Badge variant="secondary">Cached</Badge>
                          )}
                          {translationResult.aiGenerated && (
                            <Badge variant="default">AI Generated</Badge>
                          )}
                        </div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="font-medium">{translationResult.translatedText}</p>
                      </div>
                      {translationResult.quality && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Quality Score: {translationResult.quality.score}/10</span>
                          <span>•</span>
                          <span>{translationResult.quality.feedback}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyze" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Intelligent Content Detection</span>
              </CardTitle>
              <CardDescription>
                AI analyzes your content to automatically detect translatable text
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste HTML content to analyze (leave empty to analyze current page)..."
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                rows={6}
              />
              <Button 
                onClick={handleContentAnalysis} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
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

              {analysisResult && (
                <Card className="mt-4">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{analysisResult.detectedTexts}</div>
                        <div className="text-sm text-muted-foreground">Texts Detected</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-500">{analysisResult.missingTranslations}</div>
                        <div className="text-sm text-muted-foreground">Missing Translations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">{analysisResult.autoTranslations}</div>
                        <div className="text-sm text-muted-foreground">Auto-Generated</div>
                      </div>
                    </div>

                    {analysisResult.analysis?.missing?.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-semibold">Missing Translations (High Priority)</h5>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {analysisResult.analysis.missing.slice(0, 10).map((item: any, index: number) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">{item.text}</span>
                                <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}>
                                  {item.priority}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {item.context} • {item.note}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimize" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Quality Analysis</span>
                </CardTitle>
                <CardDescription>
                  AI reviews existing translations for quality improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleOptimization('analyze')} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Quality
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Consistency Check</span>
                </CardTitle>
                <CardDescription>
                  Find terminology inconsistencies across translations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleOptimization('consistency-check')} 
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Check Consistency
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {optimizationResult && (
            <Card>
              <CardContent className="pt-6">
                {optimizationResult.improvements && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Quality Improvements Suggested</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {optimizationResult.improvements.map((improvement: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <div className="text-sm text-muted-foreground">Original:</div>
                                <div className="font-medium">{improvement.original}</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <div className="text-sm text-muted-foreground">Current:</div>
                                <div className="text-sm bg-red-50 p-2 rounded">{improvement.current}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Suggested:</div>
                                <div className="text-sm bg-green-50 p-2 rounded">{improvement.suggested}</div>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <AlertCircle className="w-3 h-3 inline mr-1" />
                              {improvement.reason}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {optimizationResult.inconsistencies && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Terminology Inconsistencies</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {optimizationResult.inconsistencies.map((inconsistency: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="font-medium mb-2">{inconsistency.term}</div>
                          <div className="text-sm space-y-1">
                            <div>Variations found: {inconsistency.variations.join(', ')}</div>
                            <div className="text-green-600">Recommended: {inconsistency.recommended}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Translation Insights & Analytics</CardTitle>
              <CardDescription>
                AI-powered insights about your translation quality and coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Translation analytics and insights will be displayed here after running analysis.</p>
                <p className="text-sm mt-2">Use the other tabs to generate data for insights.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AITranslationDashboard;