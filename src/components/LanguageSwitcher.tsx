import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { useLanguage, Language } from '@/contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { 
      code: 'en' as Language, 
      name: 'English', 
      flag: '🇺🇸',
      nativeName: 'English',
      region: 'Global'
    },
    { 
      code: 'hy' as Language, 
      name: 'Հայերեն', 
      flag: '🇦🇲',
      nativeName: 'Հայերեն',
      region: 'Armenia'
    },
    { 
      code: 'ru' as Language, 
      name: 'Русский', 
      flag: '🇷🇺',
      nativeName: 'Русский',
      region: 'Russia'
    },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="hover-glow bg-card/60 backdrop-blur-md border-primary/20 text-foreground shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <Globe className="w-4 h-4 mr-2 text-primary" />
          <span className="inline sm:hidden">{currentLanguage?.flag}</span>
          <span className="hidden sm:inline text-base">{currentLanguage?.flag}</span>
          <span className="hidden md:inline ml-2 font-medium">{currentLanguage?.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 bg-card/95 backdrop-blur-xl border-primary/20 shadow-2xl rounded-xl"
        sideOffset={8}
      >
        <div className="p-2 space-y-1">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center justify-between py-4 px-4 cursor-pointer rounded-lg transition-all duration-200 ${
                language === lang.code 
                  ? 'bg-primary/10 text-primary border border-primary/20' 
                  : 'hover:bg-muted/60 hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-xl">{lang.flag}</span>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{lang.nativeName}</span>
                  <span className="text-xs text-muted-foreground">{lang.region}</span>
                </div>
              </div>
              {language === lang.code && (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">Active</span>
                  <Check className="w-4 h-4 text-primary" />
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </div>
        <div className="border-t border-border/50 p-3 mt-2">
          <p className="text-xs text-muted-foreground text-center">
            🌍 Content adapts automatically to your language
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;