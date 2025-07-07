import { useLanguage } from '@/contexts/LanguageContext';
import { ReactNode } from 'react';

export interface ContentVariant {
  en: ReactNode;
  hy: ReactNode;
  ru: ReactNode;
}

interface CulturallyAdaptiveContentProps {
  variants: ContentVariant;
  fallback?: ReactNode;
}

const CulturallyAdaptiveContent = ({ variants, fallback }: CulturallyAdaptiveContentProps) => {
  const { language } = useLanguage();
  
  // Return language-specific content or fallback to English
  const content = variants[language] || variants.en || fallback;
  
  return <>{content}</>;
};

// Helper component for culturally adaptive hero sections
export const CulturalHeroContent = () => {
  const { language } = useLanguage();
  
  const heroVariants: ContentVariant = {
    en: (
      <div className="space-y-6">
        <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-accent-secondary/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-primary/20 shadow-lg animate-scale-in">
          <span className="text-sm font-semibold text-gradient">🏆 Business Fundamentals League</span>
        </div>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-8 leading-[1.1] tracking-tight animate-slide-up">
          Master business skills with
          <br />
          <span className="text-gradient">TopOne Academy</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium max-w-4xl mx-auto mb-12 animate-fade-in">
          Join the Business Fundamentals League and gain confidence through 
          <span className="text-primary font-bold"> visual learning</span>.
          Transform complex concepts into actionable insights.
        </p>
        <CulturalCallToAction />
      </div>
    ),
    hy: (
      <div className="space-y-8">
        <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-accent-secondary/10 backdrop-blur-sm rounded-full px-8 py-4 mb-10 border border-primary/20 shadow-lg animate-scale-in">
          <span className="text-sm font-semibold text-gradient">🏆 Բիզնես հիմունքների լիգա</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-10 leading-[1.2] tracking-wide animate-slide-up">
          Տիրապետիր բիզնես հմտություններին
          <br />
          <span className="text-gradient">TopOne ակադեմիայի</span> հետ
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium max-w-4xl mx-auto mb-14 animate-fade-in">
          Միացիր Բիզնես հիմունքների լիգային և ձեռք բեր վստահություն 
          <span className="text-primary font-bold"> տեսողական ուսուցման</span> միջոցով։
          Փոխակերպիր բարդ հասկացությունները գործնական գիտելիքի։
        </p>
        <CulturalCallToAction />
      </div>
    ),
    ru: (
      <div className="space-y-6">
        <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-accent-secondary/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-primary/20 shadow-lg animate-scale-in">
          <span className="text-sm font-semibold text-gradient">🏆 Лига основ бизнеса</span>
        </div>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-8 leading-[1.1] tracking-tight animate-slide-up">
          Овладей навыками бизнеса с
          <br />
          <span className="text-gradient">TopOne Академией</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium max-w-4xl mx-auto mb-12 animate-fade-in">
          Присоединяйся к Лиге основ бизнеса и обретай уверенность через 
          <span className="text-primary font-bold"> визуальное обучение</span>.
          Превращай сложные концепции в практические решения.
        </p>
        <CulturalCallToAction />
      </div>
    )
  };

  return <CulturallyAdaptiveContent variants={heroVariants} />;
};

// Helper component for culturally adaptive CTAs
export const CulturalCallToAction = () => {
  const { language } = useLanguage();
  
  const ctaVariants: ContentVariant = {
    en: (
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
        <button className="btn-hero px-8 py-4 text-lg font-bold group">
          <span className="flex items-center gap-2">
            🚀 Join Business League
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </button>
        <button className="btn-outline-enhanced px-6 py-4 text-base font-semibold">
          <span className="flex items-center gap-2">
            ▶ Watch Preview
          </span>
        </button>
      </div>
    ),
    hy: (
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-lg mx-auto">
        <button className="btn-hero px-10 py-5 text-lg font-bold group">
          <span className="flex items-center gap-3">
            🚀 Միանալ բիզնես լիգային
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </button>
        <button className="btn-outline-enhanced px-8 py-5 text-base font-semibold">
          <span className="flex items-center gap-2">
            ▶ Դիտել նախադիտումը
          </span>
        </button>
      </div>
    ),
    ru: (
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
        <button className="btn-hero px-8 py-4 text-lg font-bold group">
          <span className="flex items-center gap-2">
            🚀 Присоединиться к лиге
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </button>
        <button className="btn-outline-enhanced px-6 py-4 text-base font-semibold">
          <span className="flex items-center gap-2">
            ▶ Смотреть превью
          </span>
        </button>
      </div>
    )
  };

  return <CulturallyAdaptiveContent variants={ctaVariants} />;
};

export default CulturallyAdaptiveContent;