import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'react-router-dom';

export const AutoTranslateProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useLanguage();
  const location = useLocation();

  console.log('🔄 AutoTranslateProvider initialized for:', location.pathname);

  // Hook into route changes to re-translate new content
  useEffect(() => {
    console.log('🌐 Route changed to:', location.pathname, 'Language:', language);
    
    // Always initialize translation engine on route change
    if (language !== 'en') {
      // Small delay to let new content load before translating
      setTimeout(async () => {
        try {
          const { translationEngine } = await import('@/lib/translationEngine');
          console.log('🔄 Re-translating page content...');
          await translationEngine.translateAll(language);
        } catch (error) {
          console.error('Failed to translate on route change:', error);
        }
      }, 300); // Slightly longer delay for better reliability
    }
  }, [location.pathname, language]);

  // Also trigger translation when language changes
  useEffect(() => {
    if (language !== 'en') {
      setTimeout(async () => {
        try {
          const { translationEngine } = await import('@/lib/translationEngine');
          console.log('🌍 Language changed, translating...');
          await translationEngine.translateAll(language);
        } catch (error) {
          console.error('Failed to translate on language change:', error);
        }
      }, 100);
    }
  }, [language]);

  return <>{children}</>;
};