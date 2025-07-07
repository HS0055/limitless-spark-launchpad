import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';

interface LanguageAdaptiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const LanguageAdaptiveLayout = ({ children, className = "" }: LanguageAdaptiveLayoutProps) => {
  const { language, isTranslating } = useLanguage();
  const [textDirection, setTextDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [fontFamily, setFontFamily] = useState('');

  useEffect(() => {
    // Set text direction and font family based on language
    switch (language) {
      case 'hy':
        setTextDirection('ltr');
        setFontFamily('system-ui, -apple-system, sans-serif'); // Armenian fonts
        document.documentElement.lang = 'hy';
        break;
      case 'ru':
        setTextDirection('ltr');
        setFontFamily('system-ui, -apple-system, sans-serif'); // Cyrillic fonts
        document.documentElement.lang = 'ru';
        break;
      default:
        setTextDirection('ltr');
        setFontFamily('system-ui, -apple-system, sans-serif');
        document.documentElement.lang = 'en';
    }

    // Update body class for language-specific styling
    document.body.className = document.body.className.replace(/lang-\w+/g, '');
    document.body.classList.add(`lang-${language}`);

    // Add translation state class
    if (isTranslating) {
      document.body.classList.add('translating');
    } else {
      document.body.classList.remove('translating');
    }

    return () => {
      document.body.classList.remove('translating', `lang-${language}`);
    };
  }, [language, isTranslating]);

  const getLanguageSpecificClasses = () => {
    let classes = '';
    
    switch (language) {
      case 'hy':
        classes += ' armenian-text';
        break;
      case 'ru':
        classes += ' cyrillic-text';
        break;
      default:
        classes += ' latin-text';
    }

    if (isTranslating) {
      classes += ' opacity-80 transition-opacity duration-300';
    }

    return classes;
  };

  return (
    <div 
      className={`${className} ${getLanguageSpecificClasses()}`}
      dir={textDirection}
      style={{ fontFamily }}
      data-language={language}
      data-translating={isTranslating}
    >
      {children}
      
      {/* Translation overlay indicator */}
      {isTranslating && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 animate-pulse z-50" />
      )}
    </div>
  );
};

export default LanguageAdaptiveLayout;