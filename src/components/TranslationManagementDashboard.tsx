import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Save, X, Plus, Languages, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface Translation {
  id: string;
  source_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  created_at: string;
}

interface EditableTranslation extends Translation {
  isEditing?: boolean;
}

const TranslationManagementDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [translations, setTranslations] = useState<EditableTranslation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [editingText, setEditingText] = useState('');

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hy', name: 'Armenian', flag: '🇦🇲' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' }
  ];

  useEffect(() => {
    if (user) {
      loadTranslations();
    }
  }, [user]);

  const loadTranslations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('translations', {
        method: 'GET'
      });
      
      if (error) throw error;
      setTranslations(data || []);
    } catch (error) {
      console.error('Error loading translations:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load translations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (translation: Translation) => {
    setTranslations(prev => prev.map(t => 
      t.id === translation.id 
        ? { ...t, isEditing: true }
        : { ...t, isEditing: false }
    ));
    setEditingText(translation.translated_text);
  };

  const cancelEditing = (translationId: string) => {
    setTranslations(prev => prev.map(t => 
      t.id === translationId 
        ? { ...t, isEditing: false }
        : t
    ));
    setEditingText('');
  };

  const saveEdit = async (translationId: string) => {
    try {
      const { error } = await supabase.functions.invoke('translations', {
        method: 'PUT',
        body: {
          id: translationId,
          translated_text: editingText
        }
      });

      if (error) throw error;

      setTranslations(prev => prev.map(t => 
        t.id === translationId 
          ? { ...t, translated_text: editingText, isEditing: false }
          : t
      ));

      toast({
        title: "Translation Updated",
        description: "Your translation has been saved successfully"
      });
    } catch (error) {
      console.error('Error updating translation:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update translation",
        variant: "destructive"
      });
    }
  };

  const filteredTranslations = translations.filter(translation => {
    const matchesSearch = translation.source_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         translation.translated_text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = languageFilter === 'all' || 
                           translation.source_language === languageFilter || 
                           translation.target_language === languageFilter;
    return matchesSearch && matchesLanguage;
  });

  const getLanguageInfo = (code: string) => {
    return languages.find(lang => lang.code === code) || { code, name: code, flag: '🌐' };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Translation Management Dashboard
          </CardTitle>
          <CardDescription>
            View, edit, and manage all your translations in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search translations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Translation Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{translations.length}</div>
                <div className="text-sm text-muted-foreground">Total Translations</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{filteredTranslations.length}</div>
                <div className="text-sm text-muted-foreground">Filtered Results</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{languages.length}</div>
                <div className="text-sm text-muted-foreground">Supported Languages</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">Live</div>
                <div className="text-sm text-muted-foreground">Real-time Editing</div>
              </CardContent>
            </Card>
          </div>

          {/* Translations List */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading translations...</p>
              </div>
            ) : filteredTranslations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No translations found</p>
              </div>
            ) : (
              filteredTranslations.map((translation) => (
                <Card key={translation.id} className="transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getLanguageInfo(translation.source_language).flag} {getLanguageInfo(translation.source_language).name}
                        </Badge>
                        <span className="text-muted-foreground">→</span>
                        <Badge variant="outline" className="text-xs">
                          {getLanguageInfo(translation.target_language).flag} {getLanguageInfo(translation.target_language).name}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(translation.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {translation.isEditing ? (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => saveEdit(translation.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => cancelEditing(translation.id)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => startEditing(translation)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Original Text
                        </label>
                        <div className="mt-1 p-3 bg-muted/50 rounded-md">
                          <p className="text-sm leading-relaxed">{translation.source_text}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Translation
                        </label>
                        {translation.isEditing ? (
                          <Textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="mt-1 min-h-[100px] resize-vertical"
                            placeholder="Edit translation..."
                          />
                        ) : (
                          <div className="mt-1 p-3 bg-muted/50 rounded-md">
                            <p className="text-sm leading-relaxed">{translation.translated_text}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranslationManagementDashboard;