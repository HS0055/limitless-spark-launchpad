import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'react-router-dom';

export const AutoTranslateProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useLanguage();
  const location = useLocation();

  console.log('🔄 AutoTranslateProvider initialized');

  // Hook into route changes to re-translate new content
  useEffect(() => {
    console.log('🌐 Route changed to:', location.pathname);
    if (language !== 'en') {
      // Small delay to let new content load before translating
      setTimeout(async () => {
        try {
          const { translationEngine } = await import('@/lib/translationEngine');
          await translationEngine.translateAll(language);
        } catch (error) {
          console.error('Failed to translate on route change:', error);
        }
      }, 200);
    }
  }, [location.pathname, language]);

  return <>{children}</>;
};