import { useCallback, useRef, useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

interface DebouncedLanguageSwitch {
  switchLanguage: (newLang: string) => void;
  currentLanguage: string;
  isTranslating: boolean;
  availableLanguages: { code: string; name: string; flag: string }[];
}

const DEBOUNCE_DELAY = 300; // ms

export const useDebouncedLanguageSwitch = (): DebouncedLanguageSwitch => {
  const translationContext = useTranslation();
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(
    translationContext.currentLanguage
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
        
        // Use only TranslationContext to avoid conflicts
        translationContext.setLanguage(newLang);
        
        // Trigger seamless translation for dynamic content
        if (newLang !== 'en') {
          const { useSeamlessTranslation } = await import('@/hooks/useSeamlessTranslation');
          // Note: This will be handled by the component using this hook
        }
        
      } catch (error) {
        // Only log error if request wasn't aborted
        if (!abortController.current?.signal.aborted) {
          console.error('Language switch failed:', error);
          // Revert optimistic update on error
          setCurrentLanguage(translationContext.currentLanguage);
        }
        
        // Restore visibility on error
        document.body.style.visibility = 'visible';
      } finally {
        // Only update loading state if request wasn't aborted
        if (!abortController.current?.signal.aborted) {
          setIsTranslating(false);
        }
      }
    }, DEBOUNCE_DELAY);
    
  }, [translationContext]);

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