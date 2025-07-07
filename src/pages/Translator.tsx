import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Languages, Copy, History, Search, Zap, RotateCw, Sparkles, Edit, Lightbulb, Clock, Target, Brain, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import MarketingLayout from '@/components/MarketingLayout';
import AIContentAnalyzer from '@/components/AIContentAnalyzer';
import BatchTranslator from '@/components/BatchTranslator';
import TranslationManagementDashboard from '@/components/TranslationManagementDashboard';
import TranslationPerformanceDashboard from '@/components/TranslationPerformanceDashboard';

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
  const [isDetectingLanguage, setIsDetectingLanguage] = useState(false);
  const [translationHistory, setTranslationHistory] = useState<Translation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [realTimeTimeout, setRealTimeTimeout] = useState<NodeJS.Timeout | null>(null);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [contextHint, setContextHint] = useState('');

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hy', name: 'Armenian', flag: '🇦🇲' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
    { code: 'da', name: 'Danish', flag: '🇩🇰' },
    { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱' },
    { code: 'cs', name: 'Czech', flag: '🇨🇿' },
    { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
    { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
    { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
    { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
    { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
    { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
    { code: 'et', name: 'Estonian', flag: '🇪🇪' },
    { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
    { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
    { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
    { code: 'be', name: 'Belarusian', flag: '🇧🇾' },
    { code: 'ka', name: 'Georgian', flag: '🇬🇪' },
    { code: 'az', name: 'Azerbaijani', flag: '🇦🇿' },
    { code: 'kk', name: 'Kazakh', flag: '🇰🇿' },
    { code: 'ky', name: 'Kyrgyz', flag: '🇰🇬' },
    { code: 'uz', name: 'Uzbek', flag: '🇺🇿' },
    { code: 'tg', name: 'Tajik', flag: '🇹🇯' },
    { code: 'mn', name: 'Mongolian', flag: '🇲🇳' },
    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
    { code: 'th', name: 'Thai', flag: '🇹🇭' },
    { code: 'ms', name: 'Malay', flag: '🇲🇾' },
    { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
    { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
    { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
    { code: 'fa', name: 'Persian', flag: '🇮🇷' },
    { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
    { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
    { code: 'ta', name: 'Tamil', flag: '🇱🇰' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
    { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
    { code: 'ne', name: 'Nepali', flag: '🇳🇵' },
    { code: 'si', name: 'Sinhala', flag: '🇱🇰' },
    { code: 'my', name: 'Myanmar', flag: '🇲🇲' },
    { code: 'km', name: 'Khmer', flag: '🇰🇭' },
    { code: 'lo', name: 'Lao', flag: '🇱🇦' },
    { code: 'am', name: 'Amharic', flag: '🇪🇹' },
    { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
    { code: 'yo', name: 'Yoruba', flag: '🇳🇬' },
    { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
    { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
    { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
    { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
    { code: 'is', name: 'Icelandic', flag: '🇮🇸' },
    { code: 'mt', name: 'Maltese', flag: '🇲🇹' },
    { code: 'ga', name: 'Irish', flag: '🇮🇪' },
    { code: 'cy', name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
    { code: 'eu', name: 'Basque', flag: '🏴󠁥󠁳󠁰󠁶󠁿' },
    { code: 'ca', name: 'Catalan', flag: '🏴󠁥󠁳󠁣󠁴󠁿' },
    { code: 'gl', name: 'Galician', flag: '🏴󠁥󠁳󠁧󠁡󠁿' }
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
      
      // Extract confidence and alternatives if available
      const conf = data.confidence || null;
      const alts = data.alternatives || [];
      setConfidence(conf);
      setAlternatives(alts);
      
      toast({
        title: "Translation Complete",
        description: `Text translated using Claude 4 ${conf ? `(${Math.round(conf * 100)}% confidence)` : ''}`,
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

  // Real-time translation handler
  const handleRealTimeTranslation = (text: string) => {
    if (!isRealTimeEnabled || !text.trim()) return;
    
    if (realTimeTimeout) {
      clearTimeout(realTimeTimeout);
    }
    
    const timeout = setTimeout(() => {
      handleTranslate();
    }, 1500); // Wait 1.5 seconds after user stops typing
    
    setRealTimeTimeout(timeout);
  };

  // Enhanced translation with context
  const handleContextualTranslate = async () => {
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
          targetLang: targetLang,
          context: contextHint,
          enhancedMode: true
        }
      });
      
      if (error) throw error;
      
      const translation = data.translatedText;
      setTranslatedText(translation);
      setConfidence(data.confidence || null);
      setAlternatives(data.alternatives || []);
      
      if (user) {
        await saveTranslation(sourceText, translation, sourceLang, targetLang);
      }
      
      toast({
        title: "Contextual Translation Complete",
        description: "Enhanced translation with context analysis completed",
      });
    } catch (error) {
      console.error('Contextual translation error:', error);
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

  // One-button switch function
  const handleLanguageSwitch = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    
    // Also swap the texts if both exist
    if (sourceText && translatedText) {
      const tempText = sourceText;
      setSourceText(translatedText);
      setTranslatedText(tempText);
    }
    
    toast({
      title: "Languages Switched",
      description: "Source and target languages have been swapped",
    });
  };

  // Auto-detect language function
  const handleAutoDetect = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "No Text",
        description: "Please enter text for language detection",
        variant: "destructive"
      });
      return;
    }

    setIsDetectingLanguage(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-translate', {
        body: {
          text: sourceText,
          sourceLang: 'auto', // Special code for auto-detection
          targetLang: sourceLang, // This will be ignored for detection
          detectOnly: true
        }
      });
      
      if (error) throw error;
      
      const detectedLang = data.detectedLanguage;
      if (detectedLang && detectedLang !== sourceLang) {
        setSourceLang(detectedLang);
        const langName = languages.find(l => l.code === detectedLang)?.name || detectedLang;
        toast({
          title: "Language Detected",
          description: `Detected language: ${langName}`,
        });
      } else {
        toast({
          title: "Language Detection",
          description: "Current language selection appears correct",
        });
      }
    } catch (error) {
      console.error('Language detection error:', error);
      toast({
        title: "Detection Failed",
        description: "Failed to detect language. Using current selection.",
        variant: "destructive"
      });
    } finally {
      setIsDetectingLanguage(false);
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground/80 bg-clip-text text-transparent mb-4 animate-fade-in">
              AI Translation Suite
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
              Advanced Claude 4-powered translation with 70+ languages, real-time processing, and context-aware intelligence
            </p>
          </div>

          <Tabs defaultValue="translate" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="translate" className="flex items-center gap-2">
                <Languages className="w-4 h-4" />
                Translate
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Manage
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Performance
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
                     {/* Enhanced Language Selection with Switch Button */}
                     <div className="flex items-center gap-3">
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
                                   {lang.flag} {lang.name}
                                 </span>
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                       </div>
                       
                       {/* PROMINENT ONE-BUTTON SWITCH ICON */}
                       <div className="flex flex-col items-center pt-6">
                         <Button
                           onClick={handleLanguageSwitch}
                           variant="outline"
                           size="lg"
                           className="w-14 h-14 rounded-full border-2 border-primary/20 hover:border-primary hover:bg-primary/5 hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl"
                           title="Switch Languages"
                         >
                           <RotateCw className="w-6 h-6 text-primary" />
                         </Button>
                         <span className="text-xs text-muted-foreground mt-1 font-medium">Switch</span>
                       </div>
                       
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
                                   {lang.flag} {lang.name}
                                 </span>
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                       </div>
                     </div>

                     <div className="space-y-2">
                       <div className="flex items-center justify-between">
                         <label className="text-sm font-medium">Text to translate</label>
                         <Button
                           onClick={handleAutoDetect}
                           variant="ghost"
                           size="sm"
                           disabled={isDetectingLanguage || !sourceText.trim()}
                           className="text-primary hover:text-primary-foreground hover:bg-primary"
                         >
                           {isDetectingLanguage ? (
                             <>
                               <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                               Detecting...
                             </>
                           ) : (
                             <>
                               <Sparkles className="w-3 h-3 mr-1" />
                               Auto-Detect
                             </>
                           )}
                         </Button>
                       </div>
                         <Textarea
                           value={sourceText}
                           onChange={(e) => {
                             setSourceText(e.target.value);
                             handleRealTimeTranslation(e.target.value);
                           }}
                           placeholder="Enter text to translate... (supports long texts, real-time enabled)"
                           rows={12}
                           className="resize-vertical min-h-[200px] max-h-[400px] font-mono text-sm leading-relaxed transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                         />
                      </div>

                      {/* Context Hint Input */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Brain className="w-4 h-4 text-primary" />
                          Context Hint (Optional)
                        </label>
                        <input
                          type="text"
                          value={contextHint}
                          onChange={(e) => setContextHint(e.target.value)}
                          placeholder="e.g., business document, casual conversation, technical manual..."
                          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/20 text-sm"
                        />
                      </div>

                      {/* Real-time Toggle */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Real-time Translation</span>
                        </div>
                        <button
                          onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isRealTimeEnabled ? 'bg-primary' : 'bg-muted-foreground/20'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isRealTimeEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                     <div className="grid grid-cols-2 gap-3">
                       <Button 
                         onClick={handleTranslate} 
                         disabled={isTranslating || !sourceText.trim()}
                         className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
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
                       
                       <Button 
                         onClick={handleContextualTranslate} 
                         disabled={isTranslating || !sourceText.trim()}
                         variant="outline"
                         className="border-primary/30 hover:bg-primary/5"
                       >
                         {isTranslating ? (
                           <>
                             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                             Analyzing...
                           </>
                         ) : (
                           <>
                             <Brain className="w-4 h-4 mr-2" />
                             Smart Translate
                           </>
                         )}
                       </Button>
                     </div>

                     {translatedText && (
                       <div className="space-y-4">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <label className="text-sm font-medium">Translation</label>
                             {confidence && (
                               <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
                                 <Star className="w-3 h-3 text-primary" />
                                 <span className="text-xs font-medium text-primary">
                                   {Math.round(confidence * 100)}%
                                 </span>
                               </div>
                             )}
                           </div>
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={copyToClipboard}
                             className="hover:bg-primary hover:text-primary-foreground"
                           >
                             <Copy className="w-4 h-4 mr-1" />
                             Copy
                           </Button>
                         </div>
                          <div className="p-4 bg-gradient-to-br from-muted/50 to-muted rounded-lg max-h-[400px] overflow-y-auto border border-border/50">
                            <p className="text-sm leading-relaxed font-mono whitespace-pre-wrap">{translatedText}</p>
                          </div>
                          
                          {alternatives.length > 0 && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-primary" />
                                Alternative Translations
                              </label>
                              <div className="space-y-2">
                                {alternatives.slice(0, 3).map((alt, index) => (
                                  <div
                                    key={index}
                                    className="p-3 bg-muted/30 rounded-lg border border-border/30 cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => setTranslatedText(alt)}
                                  >
                                    <p className="text-sm leading-relaxed">{alt}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
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
                       <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                         <span className="text-sm font-medium">AI Powered</span>
                         <span className="text-lg font-semibold text-primary">Claude 4</span>
                       </div>
                       {confidence && (
                         <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                           <span className="text-sm font-medium">Last Confidence</span>
                           <span className="text-lg font-semibold text-green-600">{Math.round(confidence * 100)}%</span>
                         </div>
                       )}
                       <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                         <span className="text-sm font-medium">Real-time Mode</span>
                         <span className={`text-sm font-semibold ${isRealTimeEnabled ? 'text-green-600' : 'text-muted-foreground'}`}>
                           {isRealTimeEnabled ? 'ON' : 'OFF'}
                         </span>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="manage">
              <TranslationManagementDashboard />
            </TabsContent>

            <TabsContent value="performance">
              <TranslationPerformanceDashboard />
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