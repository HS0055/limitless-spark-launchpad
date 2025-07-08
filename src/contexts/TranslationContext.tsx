import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ICU from 'i18next-icu';

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
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
  { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
  { code: 'et', name: 'Estonian', flag: '🇪🇪' },
  { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'mt', name: 'Maltese', flag: '🇲🇹' },
  { code: 'ga', name: 'Irish', flag: '🇮🇪' },
  { code: 'cy', name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'is', name: 'Icelandic', flag: '🇮🇸' },
  { code: 'mk', name: 'Macedonian', flag: '🇲🇰' },
  { code: 'sq', name: 'Albanian', flag: '🇦🇱' },
  { code: 'eu', name: 'Basque', flag: '🏴󠁥󠁳󠁰󠁶󠁿' },
  { code: 'ca', name: 'Catalan', flag: '🏴󠁥󠁳󠁣󠁴󠁿' },
  { code: 'gl', name: 'Galician', flag: '🏴󠁥󠁳󠁧󠁡󠁿' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' }
];

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider = ({ children }: TranslationProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState<Record<string, Translation>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load user's language preference from localStorage and DOM
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 
                          document.documentElement.lang ||
                          'en';
    if (savedLanguage && availableLanguages.find(l => l.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
      document.documentElement.lang = savedLanguage;
    }
  }, []);

  // Load translations when language changes
  useEffect(() => {
    if (currentLanguage !== 'en') {
      loadTranslationsForPage();
    } else {
      // Clear translations when switching to English
      setTranslations({});
    }
  }, [currentLanguage]);

  // Listen for translation updates from auto-translate system
  useEffect(() => {
    const handleTranslationUpdate = () => {
      if (currentLanguage !== 'en') {
        loadTranslationsForPage();
      }
    };

    window.addEventListener('translations-updated', handleTranslationUpdate);
    return () => window.removeEventListener('translations-updated', handleTranslationUpdate);
  }, [currentLanguage]);

  const loadTranslationsForPage = async () => {
    setIsLoading(true);
    try {
      const currentPath = window.location.pathname;
      
      const { data, error } = await supabase
        .from('website_translations')
        .select('original_text, translated_text, target_language, page_path')
        .eq('target_language', currentLanguage)
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
    
    // Force DOM update to persist language across route changes
    document.documentElement.lang = lang;
    
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

    // If no translation found, queue for missing key handler
    handleMissingKey(cleanText, currentLanguage);
    
    // Return original text as fallback
    return text;
  };

  const handleMissingKey = async (key: string, lng: string) => {
    // Skip for English language
    if (lng === 'en') {
      return;
    }

    // Always log in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[i18n] Missing translation: ${lng}:${key}`);
    }

    // Queue for translation in both development and production

    try {
      await fetch('https://mbwieeegglyprxoncckdj.supabase.co/functions/v1/queue-missing-translation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id2llZWdnbHlwcnhvbmNja2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NzE3MzQsImV4cCI6MjA2NzM0NzczNH0.mSp5jZo9OgsP7xRYueRqUH9GyXiqoERbnoR2JHWnjPk'
        },
        body: JSON.stringify({
          key,
          fallback: key,
          lng,
          page_path: window.location.pathname
        })
      });
    } catch (error) {
      // Silent fail - don't block UI for translation queue errors
      console.debug('Failed to queue missing translation:', error);
    }
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