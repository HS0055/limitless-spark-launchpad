import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'react-router-dom';

export const AutoTranslateProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useLanguage();
  const location = useLocation();

  console.log('🔄 AutoTranslateProvider initialized for:', location.pathname);

  // PERFORMANCE FIX: Optimize route change translations
  useEffect(() => {
    console.log('🌐 Route changed to:', location.pathname, 'Language:', language);
    
    // Only translate on route changes for non-English languages
    if (language !== 'en') {
      // Increased delay to reduce rapid re-translations
      const timer = setTimeout(async () => {
        try {
          const { translationEngine } = await import('@/lib/translationEngine');
          console.log('🔄 Re-translating page content...');
          await translationEngine.translateAll(language);
        } catch (error) {
          console.error('Failed to translate on route change:', error);
        }
      }, 800); // Increased delay to prevent rapid fire translations

      return () => clearTimeout(timer);
    }
  }, [location.pathname, language]);

  // PERFORMANCE FIX: Debounce language changes
  useEffect(() => {
    if (language !== 'en') {
      const timer = setTimeout(async () => {
        try {
          const { translationEngine } = await import('@/lib/translationEngine');
          console.log('🌍 Language changed, translating...');
          await translationEngine.translateAll(language);
        } catch (error) {
          console.error('Failed to translate on language change:', error);
        }
      }, 500); // Increased delay for language changes

      return () => clearTimeout(timer);
    }
  }, [language]);

  return <>{children}</>;
};