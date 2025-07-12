import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check, Loader2 } from 'lucide-react';
import { useDebouncedLanguageSwitch } from '@/hooks/useDebouncedLanguageSwitch';
import { useSeamlessTranslation } from '@/hooks/useSeamlessTranslation';
import { TranslationLoader, useTranslationLoader } from '@/components/TranslationLoader';
import { useEffect } from 'react';

const LanguageSwitcher = () => {
  const { switchLanguage, currentLanguage, isTranslating, availableLanguages } = useDebouncedLanguageSwitch();
  const { translatePage, isTranslating: isSeamlessTranslating, progress, error } = useSeamlessTranslation();
  const { loaderState, showLoader, updateProgress, hideLoader, setError } = useTranslationLoader();

  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage);

  // Enhanced language switching with seamless translation
  const handleLanguageSwitch = async (langCode: string) => {
    if (langCode === currentLanguage) return;
    
    try {
      showLoader(currentLanguage, langCode);
      
      // Switch language in contexts first
      switchLanguage(langCode);
      
      // Then apply seamless translation
      if (langCode !== 'en') {
        updateProgress(20, 'detecting');
        await translatePage(langCode);
        updateProgress(100, 'complete');
      } else {
        updateProgress(100, 'complete');
      }
      
      hideLoader(1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      hideLoader(3000);
    }
  };

  // Update loader progress when seamless translation progresses
  useEffect(() => {
    if (isSeamlessTranslating) {
      if (progress < 20) {
        updateProgress(20, 'detecting');
      } else if (progress < 80) {
        updateProgress(progress, 'translating');
      } else {
        updateProgress(progress, 'applying');
      }
    }
  }, [isSeamlessTranslating, progress, updateProgress]);

  return (
    <>
      <TranslationLoader
        isVisible={loaderState.isVisible}
        progress={loaderState.progress}
        currentLanguage={currentLanguage}
        targetLanguage={currentLanguage} // This would be the target in actual implementation
        phase={loaderState.phase}
        translatedCount={loaderState.translatedCount}
        totalCount={loaderState.totalCount}
        error={loaderState.error}
      />
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="hover-glow bg-background/95 backdrop-blur-sm border-border/50"
          disabled={isTranslating}
        >
          {isTranslating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Globe className="w-4 h-4 mr-2" />
          )}
          <span className="hidden sm:inline">{currentLang?.flag}</span>
          <span className="hidden md:inline ml-1">{currentLang?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-background/95 backdrop-blur-md border-border/50 shadow-xl"
        sideOffset={5}
      >
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageSwitch(lang.code)}
            className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </div>
            {currentLanguage === lang.code && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
};

export default LanguageSwitcher;