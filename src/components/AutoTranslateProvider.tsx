import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'react-router-dom';
import { translationEngine } from '@/lib/translationEngine';

export const AutoTranslateProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useLanguage();
  const location = useLocation();

  // Hook into language changes
  useEffect(() => {
    translationEngine.onLanguageChange(language);
  }, [language]);

  // Hook into route changes
  useEffect(() => {
    translationEngine.onRouteChange(location.pathname);
  }, [location.pathname]);

  // Initialize with current language if not English
  useEffect(() => {
    if (language !== 'en') {
      translationEngine.translateAll(language);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      translationEngine.destroy();
    };
  }, []);

  return <>{children}</>;
};