import { useLanguage } from '@/contexts/LanguageContext';
import CulturallyAdaptiveContent, { ContentVariant } from './CulturallyAdaptiveContent';

export const CulturalFloatingElements = () => {
  const { language } = useLanguage();
  
  const floatingVariants: ContentVariant = {
    en: (
      <>
        <div className="absolute top-6 right-6 bg-background/90 backdrop-blur-md rounded-xl px-4 py-3 text-sm font-semibold border border-border shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            📈 Business Growth
          </div>
        </div>
        <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur-md rounded-xl px-4 py-3 text-sm font-semibold border border-border shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            🎯 Visual Learning
          </div>
        </div>
      </>
    ),
    hy: (
      <>
        <div className="absolute top-6 right-6 bg-background/90 backdrop-blur-md rounded-xl px-4 py-3 text-sm font-semibold border border-border shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            📈 Բիզնեսի առաջընթաց
          </div>
        </div>
        <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur-md rounded-xl px-4 py-3 text-sm font-semibold border border-border shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            🎯 Տեսողական ուսուցում
          </div>
        </div>
      </>
    ),
    ru: (
      <>
        <div className="absolute top-6 right-6 bg-background/90 backdrop-blur-md rounded-xl px-4 py-3 text-sm font-semibold border border-border shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            📈 Рост бизнеса
          </div>
        </div>
        <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur-md rounded-xl px-4 py-3 text-sm font-semibold border border-border shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            🎯 Визуальное обучение
          </div>
        </div>
      </>
    )
  };

  return <CulturallyAdaptiveContent variants={floatingVariants} />;
};

export default CulturalFloatingElements;