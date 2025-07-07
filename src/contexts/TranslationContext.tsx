import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Translation {
  original_text: string;
  translated_text: string;
  target_language: string;
  page_path: string;
}

interface TranslationContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  translate: (text: string) => string;
  availableLanguages: { code: string; name: string; flag: string }[];
  isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
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

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider = ({ children }: TranslationProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState<Record<string, Translation>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load user's language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && availableLanguages.find(l => l.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Load translations when language changes
  useEffect(() => {
    if (currentLanguage !== 'en') {
      loadTranslationsForPage();
    }
  }, [currentLanguage]);

  const loadTranslationsForPage = async () => {
    setIsLoading(true);
    try {
      const currentPath = window.location.pathname;
      
      const { data, error } = await supabase
        .from('website_translations')
        .select('original_text, translated_text, target_language, page_path')
        .eq('target_language', currentLanguage)
        .eq('page_path', currentPath)
        .eq('is_active', true);

      if (error) {
        console.error('Failed to load translations:', error);
        return;
      }

      // Create a lookup map for fast translation
      const translationMap: Record<string, Translation> = {};
      if (data) {
        data.forEach(translation => {
          translationMap[translation.original_text] = translation;
        });
      }

      setTranslations(translationMap);
    } catch (error) {
      console.error('Translation loading error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    localStorage.setItem('preferred-language', lang);
    
    // OPTIMISTIC UPDATE: Immediately update UI, no page reload
    // Background translation will happen via AutoTranslateProvider
  };

  const translate = (text: string): string => {
    // If current language is English, return original text
    if (currentLanguage === 'en') {
      return text;
    }

    // Clean the text for better matching
    const cleanText = text.trim();
    
    // Look for exact match first
    if (translations[cleanText]) {
      return translations[cleanText].translated_text;
    }

    // Try to find partial matches for common phrases
    const translationKeys = Object.keys(translations);
    const partialMatch = translationKeys.find(key => 
      key.toLowerCase().includes(cleanText.toLowerCase()) || 
      cleanText.toLowerCase().includes(key.toLowerCase())
    );

    if (partialMatch && translations[partialMatch]) {
      return translations[partialMatch].translated_text;
    }

    // If no translation found, return original text
    return text;
  };

  return (
    <TranslationContext.Provider value={{
      currentLanguage,
      setLanguage,
      translate,
      availableLanguages,
      isLoading
    }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

// Helper component for translating text
interface TProps {
  children: string;
  fallback?: string;
}

export const T = ({ children, fallback }: TProps) => {
  const { translate } = useTranslation();
  return <>{translate(children) || fallback || children}</>;
};