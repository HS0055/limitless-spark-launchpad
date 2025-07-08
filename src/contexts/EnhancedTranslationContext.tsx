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
  translate: (text: string, namespace?: string) => string;
  t: (key: string, namespace?: string) => string;
  availableLanguages: { code: string; name: string; flag: string }[];
  isLoading: boolean;
  reportTranslation: (originalText: string, currentTranslation: string, suggestedTranslation?: string) => Promise<void>;
  loadedNamespaces: Set<string>;
  preloadNamespaces: (namespaces: string[]) => Promise<void>;
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
  const [namespaceTranslations, setNamespaceTranslations] = useState<Record<string, Record<string, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadedNamespaces, setLoadedNamespaces] = useState<Set<string>>(new Set(['common']));

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
      // Preload all common namespaces
      preloadNamespaces(['common', 'nav', 'hero', 'features', 'pricing', 'footer']);
    } else {
      setTranslations({});
      setNamespaceTranslations({});
    }
  }, [currentLanguage]);

  // Listen for translation updates from auto-translate system
  useEffect(() => {
    const handleTranslationUpdate = () => {
      if (currentLanguage !== 'en') {
        loadTranslationsForPage();
        // Reload namespace translations
        loadedNamespaces.forEach(namespace => {
          loadNamespaceTranslations(namespace);
        });
      }
    };

    window.addEventListener('translations-updated', handleTranslationUpdate);
    return () => window.removeEventListener('translations-updated', handleTranslationUpdate);
  }, [currentLanguage, loadedNamespaces]);

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

  const loadNamespaceTranslations = async (namespace: string) => {
    try {
      // Try to load from local JSON files first
      const response = await fetch(`/locales/${currentLanguage}/${namespace}.json`);
      if (response.ok) {
        const translations = await response.json();
        setNamespaceTranslations(prev => ({
          ...prev,
          [namespace]: translations
        }));
        return;
      }
    } catch (error) {
      console.warn(`Failed to load ${namespace}.json for ${currentLanguage}:`, error);
    }

    // Fallback: load from Supabase
    try {
      const { data, error } = await supabase
        .from('website_translations')
        .select('original_text, translated_text')
        .eq('target_language', currentLanguage)
        .eq('page_path', `/${namespace}`)
        .eq('is_active', true);

      if (error) throw error;

      const translations: Record<string, string> = {};
      data?.forEach(item => {
        // Extract key from original_text (assumes format like "nav.programs")
        const key = item.original_text.split('.').pop() || item.original_text;
        translations[key] = item.translated_text;
      });

      setNamespaceTranslations(prev => ({
        ...prev,
        [namespace]: translations
      }));
    } catch (error) {
      console.error(`Failed to load namespace ${namespace}:`, error);
    }
  };

  const preloadNamespaces = async (namespaces: string[]) => {
    const newNamespaces = namespaces.filter(ns => !loadedNamespaces.has(ns));
    if (newNamespaces.length === 0) return;

    setIsLoading(true);
    try {
      await Promise.all(
        newNamespaces.map(namespace => loadNamespaceTranslations(namespace))
      );
      setLoadedNamespaces(prev => new Set([...prev, ...newNamespaces]));
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

  const translate = (text: string, namespace?: string): string => {
    // If current language is English, return original text
    if (currentLanguage === 'en') {
      return text;
    }

    // Try namespace-specific translation first
    if (namespace && namespaceTranslations[namespace]) {
      const key = text.split('.').pop() || text;
      if (namespaceTranslations[namespace][key]) {
        return namespaceTranslations[namespace][key];
      }
    }

    // Clean the text for better matching
    const cleanText = text.trim();
    
    // Look for exact match in general translations
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
    handleMissingKey(cleanText, currentLanguage, namespace);
    
    // Return original text as fallback
    return text;
  };

  // Alias for translate function to match i18next API
  const t = (key: string, namespace?: string) => translate(key, namespace);

  const handleMissingKey = async (key: string, lng: string, namespace?: string) => {
    // Skip for English language
    if (lng === 'en') {
      return;
    }

    // Always log in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[i18n] Missing translation: ${lng}:${namespace ? namespace + '.' : ''}${key}`);
    }

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
          page_path: namespace ? `/${namespace}` : window.location.pathname,
          namespace
        })
      });
    } catch (error) {
      // Silent fail - don't block UI for translation queue errors
      console.debug('Failed to queue missing translation:', error);
    }
  };

  const reportTranslation = async (originalText: string, currentTranslation: string, suggestedTranslation?: string) => {
    try {
      // Use direct API call since table hasn't been added to types yet
      const response = await fetch('https://mbwieeegglyprxoncckdj.supabase.co/rest/v1/translation_reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id2llZWdnbHlwcnhvbmNja2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NzE3MzQsImV4cCI6MjA2NzM0NzczNH0.mSp5jZo9OgsP7xRYueRqUH9GyXiqoERbnoR2JHWnjPk'
        },
        body: JSON.stringify({
          original_text: originalText,
          current_translation: currentTranslation,
          suggested_translation: suggestedTranslation,
          target_language: currentLanguage,
          page_path: window.location.pathname,
          user_id: null
        })
      });

      if (response.ok) {
        // Queue for re-translation
        await handleMissingKey(originalText, currentLanguage);
        console.log('Translation reported successfully');
      }
    } catch (error) {
      console.error('Failed to report translation:', error);
    }
  };

  return (
    <TranslationContext.Provider value={{
      currentLanguage,
      setLanguage,
      translate,
      t,
      availableLanguages,
      isLoading,
      reportTranslation,
      loadedNamespaces,
      preloadNamespaces
    }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (namespaces?: string[]) => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }

  // Preload requested namespaces
  useEffect(() => {
    if (namespaces && namespaces.length > 0) {
      context.preloadNamespaces(namespaces);
    }
  }, [namespaces, context]);

  return context;
};

// Helper component for translating text with report button
interface TProps {
  children: string;
  fallback?: string;
  namespace?: string;
  showReportButton?: boolean;
}

export const T = ({ children, fallback, namespace, showReportButton = false }: TProps) => {
  const { translate, reportTranslation, currentLanguage } = useTranslation();
  const [showReport, setShowReport] = useState(false);
  
  const translatedText = translate(children, namespace) || fallback || children;
  const needsTranslation = currentLanguage !== 'en' && translatedText === children;

  return (
    <span 
      className={`relative ${needsTranslation ? 'bg-yellow-100 dark:bg-yellow-900/20' : ''}`}
      onMouseEnter={() => showReportButton && setShowReport(true)}
      onMouseLeave={() => setShowReport(false)}
    >
      {translatedText}
      {showReportButton && showReport && needsTranslation && (
        <button
          onClick={() => reportTranslation(children, translatedText)}
          className="absolute -top-8 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg hover:bg-blue-700"
          title="Report translation issue"
        >
          🚨 Report
        </button>
      )}
    </span>
  );
};