import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/contexts/TranslationContext';

interface AutoTranslateConfig {
  enabled: boolean;
  interval: number; // minutes
  maxTextsPerBatch: number;
  enabledLanguages: string[];
  enableFullSiteScan: boolean;
}

export const useAutoTranslateSystem = (config: Partial<AutoTranslateConfig> = {}) => {
  const { currentLanguage } = useTranslation();
  
  const defaultConfig: AutoTranslateConfig = {
    enabled: true,
    interval: 5, // Check every 5 minutes
    maxTextsPerBatch: 20,
    enabledLanguages: ['fr', 'de', 'es', 'ru', 'zh', 'ja', 'ko', 'ar', 'pt', 'it'],
    enableFullSiteScan: false,
    ...config
  };

  // Scan current page for missing translations
  const scanCurrentPage = useCallback(async () => {
    if (!defaultConfig.enabled) return;

    try {
      const { data, error } = await supabase.functions.invoke('auto-translate-system', {
        body: {
          mode: 'scan',
          pagePath: window.location.pathname,
          maxTextsPerBatch: defaultConfig.maxTextsPerBatch,
          targetLanguages: defaultConfig.enabledLanguages
        }
      });

      if (error) {
        console.error('❌ Auto-translate scan failed:', error);
        return;
      }

      if (data?.translated > 0) {
        console.log(`🚀 Auto-translated ${data.translated} texts for current page`);
        
        // Reload translations in context
        window.dispatchEvent(new CustomEvent('translations-updated'));
      }

    } catch (error) {
      console.error('❌ Auto-translate system error:', error);
    }
  }, [defaultConfig]);

  // Scan entire website
  const scanFullSite = useCallback(async () => {
    if (!defaultConfig.enabled || !defaultConfig.enableFullSiteScan) return;

    try {
      const { data, error } = await supabase.functions.invoke('auto-translate-system', {
        body: {
          mode: 'full-site-scan',
          maxTextsPerBatch: defaultConfig.maxTextsPerBatch,
          targetLanguages: defaultConfig.enabledLanguages
        }
      });

      if (error) {
        console.error('❌ Full site scan failed:', error);
        return;
      }

      console.log(`🌐 Full site scan completed:`, data);
      
      // Reload translations
      window.dispatchEvent(new CustomEvent('translations-updated'));

    } catch (error) {
      console.error('❌ Full site scan error:', error);
    }
  }, [defaultConfig]);

  // Continuous monitoring service
  const runContinuousMonitor = useCallback(async () => {
    if (!defaultConfig.enabled) return;

    try {
      const { data, error } = await supabase.functions.invoke('auto-translate-system', {
        body: {
          mode: 'continuous-monitor',
          maxTextsPerBatch: defaultConfig.maxTextsPerBatch,
          targetLanguages: defaultConfig.enabledLanguages
        }
      });

      if (error) {
        console.error('❌ Continuous monitor failed:', error);
        return;
      }

      if (data?.processed > 0) {
        console.log(`🔄 Processed ${data.processed} queued translations`);
        window.dispatchEvent(new CustomEvent('translations-updated'));
      }

    } catch (error) {
      console.error('❌ Continuous monitor error:', error);
    }
  }, [defaultConfig]);

  // Auto-detect and translate on page load
  useEffect(() => {
    if (!defaultConfig.enabled) return;

    const timer = setTimeout(() => {
      scanCurrentPage();
    }, 2000); // Wait 2 seconds after page load

    return () => clearTimeout(timer);
  }, [scanCurrentPage]);

  // Set up continuous monitoring
  useEffect(() => {
    if (!defaultConfig.enabled) return;

    const interval = setInterval(() => {
      runContinuousMonitor();
    }, defaultConfig.interval * 60 * 1000); // Convert minutes to milliseconds

    return () => clearInterval(interval);
  }, [runContinuousMonitor, defaultConfig.interval]);

  // Listen for route changes and scan new pages
  useEffect(() => {
    if (!defaultConfig.enabled) return;

    const handleRouteChange = () => {
      setTimeout(() => {
        scanCurrentPage();
      }, 1000); // Wait for page to load
    };

    window.addEventListener('popstate', handleRouteChange);
    
    // Also listen for programmatic navigation
    const observer = new MutationObserver((mutations) => {
      const hasNavigation = mutations.some(mutation => 
        mutation.type === 'childList' && 
        mutation.target instanceof Element &&
        mutation.target.matches('main, [role="main"], #root')
      );
      
      if (hasNavigation) {
        handleRouteChange();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      observer.disconnect();
    };
  }, [scanCurrentPage]);

  // Auto-translate when language changes
  useEffect(() => {
    if (!defaultConfig.enabled || currentLanguage === 'en') return;

    const timer = setTimeout(() => {
      scanCurrentPage();
    }, 500);

    return () => clearTimeout(timer);
  }, [currentLanguage, scanCurrentPage]);

  return {
    scanCurrentPage,
    scanFullSite,
    runContinuousMonitor,
    config: defaultConfig
  };
};