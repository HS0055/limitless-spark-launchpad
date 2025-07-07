import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Languages, Check, AlertCircle } from 'lucide-react';

interface LanguageStatusIndicatorProps {
  className?: string;
  showText?: boolean;
}

const LanguageStatusIndicator = ({ className = "", showText = true }: LanguageStatusIndicatorProps) => {
  const { language, isTranslating } = useLanguage();

  const getLanguageInfo = () => {
    switch (language) {
      case 'hy':
        return { name: 'Armenian', nativeName: 'Հայերեն', flag: '🇦🇲', color: 'bg-orange-500/10 text-orange-700 border-orange-200' };
      case 'ru':  
        return { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', color: 'bg-blue-500/10 text-blue-700 border-blue-200' };
      default:
        return { name: 'English', nativeName: 'English', flag: '🇺🇸', color: 'bg-green-500/10 text-green-700 border-green-200' };
    }
  };

  const langInfo = getLanguageInfo();

  if (language === 'en' && !isTranslating) {
    return null; // Don't show indicator for default language
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant="outline" 
        className={`
          ${langInfo.color} font-medium text-xs px-2 py-1 
          ${isTranslating ? 'animate-pulse' : ''}
          transition-all duration-300
        `}
      >
        <div className="flex items-center gap-1.5">
          {isTranslating ? (
            <Languages className="w-3 h-3 animate-spin" />
          ) : language !== 'en' ? (
            <Check className="w-3 h-3" />
          ) : (
            <AlertCircle className="w-3 h-3" />
          )}
          
          <span className="text-xs" aria-hidden="true">{langInfo.flag}</span>
          
          {showText && (
            <span className="font-medium">
              {isTranslating ? 'Translating...' : langInfo.nativeName}
            </span>
          )}
        </div>
      </Badge>
      
      {isTranslating && showText && (
        <div className="text-xs text-muted-foreground animate-pulse">
          AI processing content...
        </div>
      )}
    </div>
  );
};

export default LanguageStatusIndicator;