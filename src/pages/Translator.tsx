import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Languages, 
  ArrowRightLeft, 
  Copy, 
  History, 
  Volume2, 
  BookOpen,
  Loader2,
  CheckCircle,
  Globe
} from 'lucide-react';

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
  const [history, setHistory] = useState<Translation[]>([]);
  const [showHistory, setShowHistory] = useState(false);

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
    
    try {
      const response = await fetch('https://a048e3e6-89eb-49f4-9bfe-b3a6341ee7d3.supabase.co/functions/v1/translations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setHistory(data || []);
      }
    } catch (error) {
      console.error('Error loading translation history:', error);
      // For now, we'll disable history if there's an error
      setHistory([]);
    }
  };

  const saveTranslation = async (sourceText: string, translatedText: string, sourceLang: string, targetLang: string) => {
    if (!user) return;

    try {
      const response = await fetch('https://a048e3e6-89eb-49f4-9bfe-b3a6341ee7d3.supabase.co/functions/v1/translations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          source_text: sourceText,
          translated_text: translatedText,
          source_language: sourceLang,
          target_language: targetLang
        }),
      });
      
      if (response.ok) {
        loadTranslationHistory();
      }
    } catch (error) {
      console.error('Error saving translation:', error);
      // We'll continue without saving if there's an error
    }
  };

  const translateText = async () => {
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
      // Using MyMemory Translation API (free)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${sourceLang}|${targetLang}`
      );
      
      const data = await response.json();
      
      if (data.responseStatus === 200) {
        const translation = data.responseData.translatedText;
        setTranslatedText(translation);
        
        if (user) {
          await saveTranslation(sourceText, translation, sourceLang, targetLang);
        }
        
        toast({
          title: "Translation Complete",
          description: "Text has been successfully translated",
        });
      } else {
        throw new Error('Translation failed');
      }
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

  const swapLanguages = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    
    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy text to clipboard",
        variant: "destructive"
      });
    }
  };

  const getLanguageName = (code: string) => {
    return languages.find(lang => lang.code === code)?.name || code;
  };

  const getLanguageFlag = (code: string) => {
    return languages.find(lang => lang.code === code)?.flag || '🌐';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="content-container py-8 pt-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-accent-secondary/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-primary/20 shadow-lg">
            <Globe className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-semibold text-gradient">Multilingual Translator</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="text-gradient">Translate</span> Instantly
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Seamless translation between Armenian, Russian, and English
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Translation Interface */}
          <div className="lg:col-span-3">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="w-5 h-5 text-primary" />
                    Translation Tool
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Free Service</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHistory(!showHistory)}
                      className="hover-glow"
                    >
                      <History className="w-4 h-4 mr-2" />
                      History
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Language Selection */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">From</label>
                    <Select value={sourceLang} onValueChange={setSourceLang}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            <span className="flex items-center gap-2">
                              <span>{lang.flag}</span>
                              <span>{lang.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={swapLanguages}
                    className="mt-6 hover-glow"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">To</label>
                    <Select value={targetLang} onValueChange={setTargetLang}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            <span className="flex items-center gap-2">
                              <span>{lang.flag}</span>
                              <span>{lang.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Text Input */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">
                        {getLanguageFlag(sourceLang)} {getLanguageName(sourceLang)}
                      </label>
                      <span className="text-xs text-muted-foreground">
                        {sourceText.length}/5000
                      </span>
                    </div>
                    <Textarea
                      value={sourceText}
                      onChange={(e) => setSourceText(e.target.value)}
                      placeholder="Enter text to translate..."
                      className="min-h-[200px] resize-none"
                      maxLength={5000}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">
                        {getLanguageFlag(targetLang)} {getLanguageName(targetLang)}
                      </label>
                      {translatedText && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(translatedText)}
                          className="h-auto p-1 hover-glow"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="relative">
                      <Textarea
                        value={translatedText}
                        readOnly
                        placeholder="Translation will appear here..."
                        className="min-h-[200px] resize-none bg-muted/50"
                      />
                      {isTranslating && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            <span className="text-sm font-medium">Translating...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center">
                  <Button
                    onClick={translateText}
                    disabled={isTranslating || !sourceText.trim()}
                    className="btn-hero px-8"
                  >
                    {isTranslating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Languages className="w-4 h-4 mr-2" />
                    )}
                    Translate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Translation History */}
            {showHistory && user && (
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-accent-secondary" />
                    Recent Translations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {history.length > 0 ? (
                    <div className="space-y-4">
                      {history.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer"
                          onClick={() => {
                            setSourceText(item.source_text);
                            setTranslatedText(item.translated_text);
                            setSourceLang(item.source_language);
                            setTargetLang(item.target_language);
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium">
                              {getLanguageFlag(item.source_language)} → {getLanguageFlag(item.target_language)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm truncate mb-1">{item.source_text}</p>
                          <p className="text-sm text-muted-foreground truncate">{item.translated_text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No translation history yet
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Language Info */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent-tertiary" />
                  Supported Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {languages.map((lang) => (
                    <div key={lang.code} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <span className="text-xl">{lang.flag}</span>
                      <div>
                        <div className="font-medium text-sm">{lang.name}</div>
                        <div className="text-xs text-muted-foreground uppercase">{lang.code}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Translation Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p>• Keep sentences clear and simple for better accuracy</p>
                  <p>• Check translations with native speakers when possible</p>
                  <p>• Use formal language for professional translations</p>
                  <p>• Consider context when translating idioms</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Translator;