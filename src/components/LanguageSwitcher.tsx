import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Globe, Check, Languages } from 'lucide-react';
import { useLanguage, Language } from '@/contexts/LanguageContext';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

const LanguageSwitcher = () => {
  const { language, setLanguage, isTranslating } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages: LanguageOption[] = [
    { 
      code: 'en', 
      name: 'English', 
      nativeName: 'English',
      flag: '🇺🇸'
    },
    { 
      code: 'hy', 
      name: 'Armenian', 
      nativeName: 'Հայերեն',
      flag: '🇦🇲'
    },
    { 
      code: 'ru', 
      name: 'Russian', 
      nativeName: 'Русский',
      flag: '🇷🇺'
    },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, langCode: Language) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleLanguageChange(langCode);
    }
  };

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="group relative hover:scale-105 transition-all duration-200 min-w-fit bg-background border-border"
            disabled={isTranslating}
            aria-label={`Current language: ${currentLanguage?.name}. Click to change language`}
          >
            <div className="flex items-center gap-2">
              {isTranslating ? (
                <Languages className="w-4 h-4 animate-spin text-primary flex-shrink-0" />
              ) : (
                <Globe className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              )}
              
              <span className="text-base flex-shrink-0" aria-hidden="true">
                {currentLanguage?.flag}
              </span>
              
              <span className="hidden sm:inline font-medium text-muted-foreground">
                {currentLanguage?.code.toUpperCase()}
              </span>
            </div>
            
            {isTranslating && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-background/98 backdrop-blur-md border-border/50 shadow-xl animate-scale-in"
          sideOffset={8}
        >
          <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground font-medium px-4 py-2">
            Select Language
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/30" />
          
          {languages.map((lang, index) => {
            const isActive = language === lang.code;
            const isCurrentlyTranslating = isTranslating && isActive;
            
            return (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                onKeyDown={(e) => handleKeyDown(e, lang.code)}
                className={`
                  group flex items-center justify-between py-3 px-4 cursor-pointer 
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50
                  ${isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'hover:bg-muted/60 hover:text-foreground'
                  }
                  ${isCurrentlyTranslating ? 'animate-pulse' : ''}
                `}
                disabled={isTranslating}
                role="menuitem"
                tabIndex={0}
                aria-current={isActive ? 'true' : 'false'}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span 
                    className={`
                      text-lg transition-transform duration-200 
                      ${isActive ? 'scale-110' : 'group-hover:scale-105'}
                    `}
                    aria-hidden="true"
                  >
                    {lang.flag}
                  </span>
                  
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-medium text-sm leading-tight truncate">
                      {lang.nativeName}
                    </span>
                    <span className="text-xs text-muted-foreground leading-tight">
                      {lang.name}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isCurrentlyTranslating && (
                    <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                  
                  {isActive && !isCurrentlyTranslating && (
                    <Check className="w-4 h-4 text-primary animate-scale-in" />
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}
          
          <DropdownMenuSeparator className="bg-border/30" />
          
          <div className="px-4 py-2 text-xs text-muted-foreground">
            {isTranslating ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Translating page...
              </div>
            ) : (
              `${languages.length} languages available`
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSwitcher;