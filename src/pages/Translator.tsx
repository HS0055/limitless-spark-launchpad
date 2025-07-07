import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Languages, Copy, History, Search, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import MarketingLayout from '@/components/MarketingLayout';
import AIContentAnalyzer from '@/components/AIContentAnalyzer';
import BatchTranslator from '@/components/BatchTranslator';

interface Translation {
  id: string;
  source_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  created_at: string;
}

const Translator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hy');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationHistory, setTranslationHistory] = useState<Translation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hy', name: 'Armenian', flag: '🇦🇲' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' }
  ];

  useEffect(() => {
    if (user) {
      loadTranslationHistory();
    }
  }, [user]);

  const loadTranslationHistory = async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase.functions.invoke('translations', {
        method: 'GET'
      });
      
      if (error) throw error;
      setTranslationHistory(data || []);
    } catch (error) {
      console.error('Error loading translation history:', error);
      setTranslationHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const saveTranslation = async (sourceText: string, translatedText: string, sourceLang: string, targetLang: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('translations', {
        body: {
          source_text: sourceText,
          translated_text: translatedText,
          source_language: sourceLang,
          target_language: targetLang
        }
      });
      
      if (!error) {
        loadTranslationHistory();
      }
    } catch (error) {
      console.error('Error saving translation:', error);
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter text to translate",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-translate', {
        body: {
          text: sourceText,
          sourceLang: sourceLang,
          targetLang: targetLang
        }
      });
      
      if (error) throw error;
      
      const translation = data.translatedText;
      setTranslatedText(translation);
      
      if (user) {
        await saveTranslation(sourceText, translation, sourceLang, targetLang);
      }
      
      toast({
        title: "Translation Complete",
        description: "Text has been successfully translated using GPT-4.1",
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Error",
        description: "Failed to translate text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!translatedText) return;
    
    try {
      await navigator.clipboard.writeText(translatedText);
      toast({
        title: "Copied",
        description: "Translation copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy text to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Languages className="w-4 h-4 mr-2" />
              AI-Powered Translation Suite
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent mb-4">
              Professional Translator
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Complete translation solution with AI analysis, batch processing, and intelligent translations
            </p>
          </div>

          <Tabs defaultValue="translate" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="translate" className="flex items-center gap-2">
                <Languages className="w-4 h-4" />
                Translate
              </TabsTrigger>
              <TabsTrigger value="analyze" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Analyze
              </TabsTrigger>
              <TabsTrigger value="batch" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Batch
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="translate">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Translation Interface */}
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Languages className="w-5 h-5" />
                      Translate Text
                    </CardTitle>
                    <CardDescription>
                      Enter your text and select languages for translation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">From</label>
                        <Select value={sourceLang} onValueChange={setSourceLang}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
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
                      <div>
                        <label className="text-sm font-medium mb-2 block">To</label>
                        <Select value={targetLang} onValueChange={setTargetLang}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
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
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Text to translate</label>
                      <Textarea
                        value={sourceText}
                        onChange={(e) => setSourceText(e.target.value)}
                        placeholder="Enter text to translate..."
                        rows={6}
                        className="resize-none"
                      />
                    </div>

                    <Button 
                      onClick={handleTranslate} 
                      disabled={isTranslating || !sourceText.trim()}
                      className="w-full"
                    >
                      {isTranslating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Translating...
                        </>
                      ) : (
                        <>
                          <Languages className="w-4 h-4 mr-2" />
                          Translate
                        </>
                      )}
                    </Button>

                    {translatedText && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Translation</label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyToClipboard}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm leading-relaxed">{translatedText}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle>Translation Stats</CardTitle>
                    <CardDescription>Your translation activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Total Translations</span>
                        <span className="text-2xl font-bold">{translationHistory.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Languages Supported</span>
                        <span className="text-2xl font-bold">{languages.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">AI Powered</span>
                        <span className="text-lg font-semibold text-primary">GPT-4.1</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analyze">
              <AIContentAnalyzer />
            </TabsContent>

            <TabsContent value="batch">
              <BatchTranslator />
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Translation History
                  </CardTitle>
                  <CardDescription>
                    Your complete translation history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingHistory ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : translationHistory.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {translationHistory.map((translation) => (
                        <div key={translation.id} className="p-4 border border-border rounded-lg space-y-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="uppercase font-medium">{translation.source_language}</span>
                            <span>→</span>
                            <span className="uppercase font-medium">{translation.target_language}</span>
                            <span className="ml-auto">
                              {new Date(translation.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm space-y-2">
                            <div>
                              <label className="text-xs text-muted-foreground">Original</label>
                              <p className="text-muted-foreground">{translation.source_text}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Translation</label>
                              <p className="font-medium">{translation.translated_text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No translations yet. Start translating to see your history!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MarketingLayout>
  );
};

export default Translator;