import { useAutoTranslateSystem } from '@/hooks/useAutoTranslateSystem';
import { useEffect } from 'react';

interface AutoTranslateProviderProps {
  children: React.ReactNode;
  config?: {
    enabled?: boolean;
    interval?: number;
    maxTextsPerBatch?: number;
    enabledLanguages?: string[];
    enableFullSiteScan?: boolean;
  };
}

export const AutoTranslateProvider = ({ children, config = {} }: AutoTranslateProviderProps) => {
  const autoTranslate = useAutoTranslateSystem(config);

  // Initialize auto-translation system
  useEffect(() => {
    console.log('🤖 Auto-translate system initialized');
    
    // Listen for translation updates
    const handleTranslationUpdate = () => {
      console.log('🔄 Translations updated - reloading page translations');
      // Force reload of current language translations
      window.location.reload();
    };

    window.addEventListener('translations-updated', handleTranslationUpdate);

    // Optional: Run full site scan on first load (enable in production carefully)
    if (config.enableFullSiteScan) {
      const timer = setTimeout(() => {
        autoTranslate.scanFullSite();
      }, 10000); // Wait 10 seconds before full scan

      return () => {
        clearTimeout(timer);
        window.removeEventListener('translations-updated', handleTranslationUpdate);
      };
    }

    return () => {
      window.removeEventListener('translations-updated', handleTranslationUpdate);
    };
  }, [autoTranslate, config.enableFullSiteScan]);

  return <>{children}</>;
};