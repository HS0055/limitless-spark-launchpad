import { useLanguage } from '@/contexts/LanguageContext';
import { ReactNode } from 'react';

interface LanguageAdaptiveLayoutProps {
  children: ReactNode;
  className?: string;
}

const LanguageAdaptiveLayout = ({ children, className = '' }: LanguageAdaptiveLayoutProps) => {
  const { language } = useLanguage();

  // Language-specific styling and layout adjustments
  const getLanguageStyles = () => {
    const baseStyles = className;
    
    switch (language) {
      case 'hy':
        // Armenian: Prefer larger fonts, more spacing for better readability
        return `${baseStyles} font-armenian text-base leading-relaxed tracking-wide`;
      case 'ru':
        // Russian: Optimal for Cyrillic readability, slightly condensed
        return `${baseStyles} font-cyrillic text-base leading-snug tracking-normal`;
      case 'en':
      default:
        // English: Standard Western typography
        return `${baseStyles} font-latin text-base leading-normal tracking-normal`;
    }
  };

  // Direction and text alignment based on language
  const getTextDirection = () => {
    // All supported languages are LTR, but this could be extended for RTL languages
    return 'ltr';
  };

  // Language-specific content density
  const getContentDensity = () => {
    switch (language) {
      case 'hy':
        // Armenian text tends to be longer, need more space
        return 'space-y-6';
      case 'ru':
        // Russian is fairly compact
        return 'space-y-4';
      case 'en':
      default:
        return 'space-y-5';
    }
  };

  return (
    <div 
      className={`${getLanguageStyles()} ${getContentDensity()}`}
      dir={getTextDirection()}
      lang={language}
    >
      {children}
    </div>
  );
};

export default LanguageAdaptiveLayout;