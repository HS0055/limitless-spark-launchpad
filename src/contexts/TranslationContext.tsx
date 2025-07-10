import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '../../locales/en/common.json';
import de from '../../locales/de/common.json';
import ru from '../../locales/ru/common.json';

const localTranslations: Record<string, Record<string, string>> = {
  en,
  de,
  ru
};

interface TranslationContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  translate: (text: string) => string;
  availableLanguages: { code: string; name: string; flag: string }[];
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' }
];

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider = ({ children }: TranslationProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // Load user's language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && availableLanguages.find(l => l.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Load translations when language changes
  useEffect(() => {
    const localMap = localTranslations[currentLanguage] || {};
    setTranslations(localMap);
  }, [currentLanguage]);


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
      return translations[cleanText];
    }

    // Try to find partial matches for common phrases
    const translationKeys = Object.keys(translations);
    const partialMatch = translationKeys.find(key => 
      key.toLowerCase().includes(cleanText.toLowerCase()) || 
      cleanText.toLowerCase().includes(key.toLowerCase())
    );

    if (partialMatch && translations[partialMatch]) {
      return translations[partialMatch];
    }

    // If no translation found, queue for missing key handler
    handleMissingKey(cleanText, currentLanguage);
    
    // Return original text as fallback
    return text;
  };

  const handleMissingKey = (key: string, lng: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[i18n] Missing translation: ${lng}:${key}`);
    }
  };

  return (
    <TranslationContext.Provider value={{
      currentLanguage,
      setLanguage,
      translate,
      availableLanguages
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