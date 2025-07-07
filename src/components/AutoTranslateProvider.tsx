import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'react-router-dom';
import { translationEngine } from '@/lib/translationEngine';

export const AutoTranslateProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useLanguage();
  const location = useLocation();

  console.log('🔄 AutoTranslateProvider initialized');

  // Hook into language changes
  useEffect(() => {
    console.log('🌐 Language changed to:', language);
    translationEngine.onLanguageChange(language);
  }, [language]);

  // Hook into route changes
  useEffect(() => {
    console.log('🌐 Route changed to:', location.pathname);
    translationEngine.onRouteChange(location.pathname);
  }, [location.pathname]);

  // Initialize with current language if not English
  useEffect(() => {
    if (language !== 'en') {
      console.log('🚀 Initializing translation for:', language);
      translationEngine.translateAll(language);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up translation engine');
      translationEngine.destroy();
    };
  }, []);

  return <>{children}</>;
};