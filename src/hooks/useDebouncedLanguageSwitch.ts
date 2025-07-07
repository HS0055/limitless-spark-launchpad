import { useCallback, useRef, useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/contexts/TranslationContext';

interface DebouncedLanguageSwitch {
  switchLanguage: (newLang: string) => void;
  currentLanguage: string;
  isTranslating: boolean;
  availableLanguages: { code: string; name: string; flag: string }[];
}

const DEBOUNCE_DELAY = 300; // ms

export const useDebouncedLanguageSwitch = (): DebouncedLanguageSwitch => {
  const languageContext = useLanguage();
  const translationContext = useTranslation();
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(
    translationContext.currentLanguage || languageContext.language
  );
  
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const switchLanguage = useCallback(async (newLang: string) => {
    // Cancel any ongoing requests
    if (abortController.current) {
      abortController.current.abort();
    }
    
    // Clear existing debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // OPTIMISTIC UPDATE: Update UI immediately
    setCurrentLanguage(newLang);
    
    // Start loading state
    setIsTranslating(true);
    
    // Create new abort controller
    abortController.current = new AbortController();
    
    // Debounce the actual translation work
    debounceTimer.current = setTimeout(async () => {
      try {
        // Check if request was aborted
        if (abortController.current?.signal.aborted) {
          return;
        }
        
        // ANTI-FLICKER: Add global styles to prevent visual disruption
        const antiFlickerStyle = document.createElement('style');
        antiFlickerStyle.id = 'anti-flicker-styles';
        antiFlickerStyle.textContent = `
          body { 
            transition: none !important; 
            animation: none !important;
          }
          * { 
            transition: none !important; 
            animation: none !important;
          }
        `;
        document.head.appendChild(antiFlickerStyle);
        
        // Update both contexts
        languageContext.setLanguage(newLang as any);
        translationContext.setLanguage(newLang);
        
        // Trigger translation engine for dynamic content
        if (newLang !== 'en') {
          const { translationEngine } = await import('@/lib/translationEngine');
          await translationEngine.translateAll(newLang as any);
        }
        
        // Remove anti-flicker styles after translation
        setTimeout(() => {
          const style = document.getElementById('anti-flicker-styles');
          if (style) style.remove();
        }, 200);
        
      } catch (error) {
        // Only log error if request wasn't aborted
        if (!abortController.current?.signal.aborted) {
          console.error('Language switch failed:', error);
          // Revert optimistic update on error
          setCurrentLanguage(translationContext.currentLanguage);
        }
        
        // Clean up styles on error
        const style = document.getElementById('anti-flicker-styles');
        if (style) style.remove();
      } finally {
        // Only update loading state if request wasn't aborted
        if (!abortController.current?.signal.aborted) {
          setIsTranslating(false);
        }
      }
    }, DEBOUNCE_DELAY);
    
  }, [languageContext, translationContext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return {
    switchLanguage,
    currentLanguage,
    isTranslating,
    availableLanguages: translationContext.availableLanguages
  };
};