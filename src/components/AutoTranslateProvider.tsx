import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'react-router-dom';

export const AutoTranslateProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useLanguage();
  const location = useLocation();

  console.log('🔄 AutoTranslateProvider initialized for:', location.pathname);

  // PERFORMANCE FIX: Only trigger on route changes, language changes handled by useDebouncedLanguageSwitch
  useEffect(() => {
    console.log('🌐 Route changed to:', location.pathname);
    
    // Only translate on route changes if language is not English
    if (language !== 'en') {
      const timer = setTimeout(async () => {
        try {
          const { translationEngine } = await import('@/lib/translationEngine');
          console.log('🔄 Re-translating page content for route change...');
          await translationEngine.translateAll(language);
        } catch (error) {
          console.error('Failed to translate on route change:', error);
        }
      }, 500); // Reduced delay since language switches are handled separately

      return () => clearTimeout(timer);
    }
  }, [location.pathname]); // REMOVED language dependency to prevent conflicts

  // REMOVED: Language change handling is now done by useDebouncedLanguageSwitch
  // This prevents multiple simultaneous translation triggers

  return <>{children}</>;
};