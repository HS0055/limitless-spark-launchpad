import { useLanguage } from '@/contexts/LanguageContext';
import CulturallyAdaptiveContent, { ContentVariant } from './CulturallyAdaptiveContent';

export const CulturalTrustIndicators = () => {
  const { language } = useLanguage();
  
  const trustVariants: ContentVariant = {
    en: (
      <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground mb-20">
        <div className="flex items-center space-x-3 bg-card/30 backdrop-blur-sm rounded-full px-6 py-3 border border-border">
          <div className="flex -space-x-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background shadow-sm" />
            ))}
          </div>
          <span className="font-medium">650+ professionals</span>
        </div>
        <div className="w-px h-6 bg-border hidden sm:block"></div>
        <div className="flex items-center gap-2 bg-card/30 backdrop-blur-sm rounded-full px-6 py-3 border border-border">
          <span className="text-lg">⚡</span>
          <span className="font-medium">5-minute lessons</span>
        </div>
        <div className="w-px h-6 bg-border hidden sm:block"></div>
        <div className="flex items-center gap-2 bg-card/30 backdrop-blur-sm rounded-full px-6 py-3 border border-border">
          <span className="text-lg">📊</span>
          <span className="font-medium">100% visual</span>
        </div>
        <div className="w-px h-6 bg-border hidden sm:block"></div>
        <div className="flex items-center gap-2 bg-card/30 backdrop-blur-sm rounded-full px-6 py-3 border border-border">
          <span className="text-lg">🎯</span>
          <span className="font-medium">No boring theory</span>
        </div>
      </div>
    ),
    hy: (
      <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground mb-20">
        <div className="flex items-center space-x-3 bg-card/30 backdrop-blur-sm rounded-full px-6 py-3 border border-border">
          <div className="flex -space-x-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background shadow-sm" />
            ))}
          </div>
          <span className="font-medium">650+ մասնագետներ</span>
        </div>
        <div className="w-px h-6 bg-border hidden sm:block"></div>
        <div className="flex items-center gap-2 bg-card/30 backdrop-blur-sm rounded-full px-6 py-3 border border-border">
          <span className="text-lg">⚡</span>
          <span className="font-medium">5-րոպե դասեր</span>
        </div>
        <div className="w-px h-6 bg-border hidden sm:block"></div>
        <div className="flex items-center gap-2 bg-card/30 backdrop-blur-sm rounded-full px-6 py-3 border border-border">
          <span className="text-lg">📊</span>
          <span className="font-medium">100% տեսողական</span>
        </div>
        <div className="w-px h-6 bg-border hidden sm:block"></div>
        <div className="flex items-center gap-2 bg-card/30 backdrop-blur-sm rounded-full px-6 py-3 border border-border">
          <span className="text-lg">🎯</span>
          <span className="font-medium">Ոչ ձանձրալի տեսություն</span>
        </div>
      </div>
    ),
    ru: (
      <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground mb-20">
        <div className="flex items-center space-x-3 bg-card/30 backdrop-blur-sm rounded-full px-6 py-3 border border-border">
          <div className="flex -space-x-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background shadow-sm" />
            ))}
          </div>
          <span className="font-medium">650+ профессионалов</span>
        </div>
        <div className="w-px h-6 bg-border hidden sm:block"></div>
        <div className="flex items-center gap-2 bg-card/30 backdrop-blur-sm rounded-full px-6 py-3 border border-border">
          <span className="text-lg">⚡</span>
          <span className="font-medium">5-минутные уроки</span>
        </div>
        <div className="w-px h-6 bg-border hidden sm:block"></div>
        <div className="flex items-center gap-2 bg-card/30 backdrop-blur-sm rounded-full px-6 py-3 border border-border">
          <span className="text-lg">📊</span>
          <span className="font-medium">100% визуально</span>
        </div>
        <div className="w-px h-6 bg-border hidden sm:block"></div>
        <div className="flex items-center gap-2 bg-card/30 backdrop-blur-sm rounded-full px-6 py-3 border border-border">
          <span className="text-lg">🎯</span>
          <span className="font-medium">Никакой скучной теории</span>
        </div>
      </div>
    )
  };

  return <CulturallyAdaptiveContent variants={trustVariants} />;
};

export default CulturalTrustIndicators;