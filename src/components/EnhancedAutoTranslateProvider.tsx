import { useStringDetection } from '@/hooks/useStringDetection';
import { useEffect, useState } from 'react';

interface AutoTranslateConfig {
  enabled?: boolean;
  interval?: number;
  maxTextsPerBatch?: number;
  enabledLanguages?: string[];
  enableFullSiteScan?: boolean;
  stringDetection?: {
    enabled: boolean;
    scanInterval: number;
    exclusions: string[];
    includeAttributes: boolean;
    detectRuntimeStrings: boolean;
  };
}

interface AutoTranslateProviderProps {
  children: React.ReactNode;
  config?: AutoTranslateConfig;
}

export const AutoTranslateProvider = ({ children, config = {} }: AutoTranslateProviderProps) => {
  const [translationStats, setTranslationStats] = useState({
    pending: 0,
    completed: 0,
    failed: 0
  });

  const defaultConfig = {
    enabled: true,
    interval: 5000, // 5 seconds
    maxTextsPerBatch: 30,
    enabledLanguages: ['hy', 'ru', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ar', 'pt', 'it', 'nl', 'pl', 'tr', 'hi', 'th', 'vi', 'sv', 'da', 'no', 'fi', 'he', 'id', 'ms', 'uk', 'cs', 'sk', 'ro', 'bg', 'hr', 'sr', 'sl', 'et', 'lv', 'lt', 'hu', 'mt', 'ga', 'cy', 'is', 'mk', 'sq', 'eu', 'ca', 'gl', 'sw', 'zu', 'af', 'bn', 'gu', 'kn', 'ml', 'mr', 'pa', 'ta', 'te', 'ur'],
    enableFullSiteScan: false,
    stringDetection: {
      enabled: true,
      scanInterval: 10000, // 10 seconds
      exclusions: ['.no-translate', '[data-no-translate]'],
      includeAttributes: true,
      detectRuntimeStrings: true
    },
    ...config
  };

  // Initialize string detection
  const stringDetection = useStringDetection(defaultConfig.stringDetection);

  // Auto-translation processing
  useEffect(() => {
    if (!defaultConfig.enabled) return;

    console.log('🤖 Enhanced Auto-translate system initialized');
    
    const processTranslationQueue = async () => {
      try {
        const response = await fetch('https://mbwieeegglyprxoncckdj.supabase.co/functions/v1/auto-translate-system', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id2llZWdnbHlwcnhvbmNja2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NzE3MzQsImV4cCI6MjA2NzM0NzczNH0.mSp5jZo9OgsP7xRYueRqUH9GyXiqoERbnoR2JHWnjPk'
          },
          body: JSON.stringify({
            mode: 'continuous-monitor',
            maxTextsPerBatch: defaultConfig.maxTextsPerBatch,
            targetLanguages: defaultConfig.enabledLanguages
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.processed > 0) {
            console.log(`✅ Processed ${result.processed} translations`);
            // Trigger UI update
            window.dispatchEvent(new CustomEvent('translations-updated'));
          }
        }
      } catch (error) {
        // Silent fail - don't crash the app for translation issues
        console.debug('Auto-translate processing error:', error);
      }
    };

    // Process queue immediately and then on interval
    processTranslationQueue();
    const interval = setInterval(processTranslationQueue, defaultConfig.interval);

    // Listen for translation updates
    const handleTranslationUpdate = () => {
      console.log('🔄 Translations updated - triggering UI refresh');
      // Trigger page refresh for components using translations
      window.dispatchEvent(new CustomEvent('translation-context-updated'));
    };

    window.addEventListener('translations-updated', handleTranslationUpdate);

    // Optional: Run full site scan on first load
    if (defaultConfig.enableFullSiteScan) {
      const scanTimer = setTimeout(() => {
        runFullSiteScan();
      }, 15000); // Wait 15 seconds before full scan

      return () => {
        clearTimeout(scanTimer);
        clearInterval(interval);
        window.removeEventListener('translations-updated', handleTranslationUpdate);
      };
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('translations-updated', handleTranslationUpdate);
    };
  }, [defaultConfig]);

  const runFullSiteScan = async () => {
    console.log('🔍 Running full site scan...');
    try {
      await fetch('https://mbwieeegglyprxoncckdj.supabase.co/functions/v1/scan-and-translate-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1id2llZWdnbHlwcnhvbmNja2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NzE3MzQsImV4cCI6MjA2NzM0NzczNH0.mSp5jZo9OgsP7xRYueRqUH9GyXiqoERbnoR2JHWnjPk'
        },
        body: JSON.stringify({
          baseUrl: window.location.origin,
          targetLanguages: defaultConfig.enabledLanguages
        })
      });
      console.log('✅ Full site scan completed');
    } catch (error) {
      // Silent fail - don't crash the app for scan issues
      console.debug('Full site scan error:', error);
    }
  };

  // Real-time translation stats monitoring
  useEffect(() => {
    const updateStats = async () => {
      try {
        const response = await fetch('/api/translation-stats');
        if (response.ok) {
          const stats = await response.json();
          setTranslationStats(stats);
        }
      } catch (error) {
        console.debug('Stats update error:', error);
      }
    };

    updateStats();
    const statsInterval = setInterval(updateStats, 30000); // Update every 30 seconds

    return () => clearInterval(statsInterval);
  }, []);

  return (
    <>
      {children}
      {/* Developer info overlay in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs z-50">
          <div className="font-bold">🤖 Auto-Translate Status</div>
          <div>Strings detected: {stringDetection.detectedStrings.length}</div>
          <div>Scanning: {stringDetection.isScanning ? '🔄' : '✅'}</div>
          <div>Queue: {translationStats.pending} pending</div>
          <div>Completed: {translationStats.completed}</div>
          {translationStats.failed > 0 && (
            <div className="text-red-400">Failed: {translationStats.failed}</div>
          )}
        </div>
      )}
    </>
  );
};