import { Star } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';
import CulturallyAdaptiveContent, { ContentVariant } from './CulturallyAdaptiveContent';

export const CulturalStatsSection = () => {
  const { language } = useLanguage();
  
  const statsVariants: ContentVariant = {
    en: (
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-center space-x-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-3xl font-bold text-primary mb-2">4.97</p>
          <p className="text-sm text-muted-foreground font-medium">Average rating from 233 reviews</p>
        </div>
        
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <p className="text-4xl font-bold text-primary mb-3">650+</p>
          <p className="text-sm text-muted-foreground font-medium mb-4">Creative professionals transformed</p>
          <div className="flex justify-center -space-x-3">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background shadow-sm"
              />
            ))}
          </div>
        </div>
        
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <p className="text-4xl font-bold text-primary mb-3">5 min</p>
          <p className="text-sm text-muted-foreground font-medium">Average lesson length</p>
          <p className="text-xs text-muted-foreground mt-2 opacity-80">Perfect for busy schedules</p>
        </div>
      </div>
    ),
    hy: (
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-center space-x-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-3xl font-bold text-primary mb-2">4.97</p>
          <p className="text-sm text-muted-foreground font-medium">Միջին գնահատական 233 գրառումներից</p>
        </div>
        
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <p className="text-4xl font-bold text-primary mb-3">650+</p>
          <p className="text-sm text-muted-foreground font-medium mb-4">Ստեղծագործ մասնագետներ զարգացած</p>
          <div className="flex justify-center -space-x-3">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background shadow-sm"
              />
            ))}
          </div>
        </div>
        
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <p className="text-4xl font-bold text-primary mb-3">5 րոպե</p>
          <p className="text-sm text-muted-foreground font-medium">Միջին դասի տևողություն</p>
          <p className="text-xs text-muted-foreground mt-2 opacity-80">Կատարյալ բրդված գրաֆիկների համար</p>
        </div>
      </div>
    ),
    ru: (
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-center space-x-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-3xl font-bold text-primary mb-2">4.97</p>
          <p className="text-sm text-muted-foreground font-medium">Средний рейтинг из 233 отзывов</p>
        </div>
        
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <p className="text-4xl font-bold text-primary mb-3">650+</p>
          <p className="text-sm text-muted-foreground font-medium mb-4">Творческих профессионалов преобразовано</p>
          <div className="flex justify-center -space-x-3">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background shadow-sm"
              />
            ))}
          </div>
        </div>
        
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <p className="text-4xl font-bold text-primary mb-3">5 мин</p>
          <p className="text-sm text-muted-foreground font-medium">Средняя продолжительность урока</p>
          <p className="text-xs text-muted-foreground mt-2 opacity-80">Идеально для занятых графиков</p>
        </div>
      </div>
    )
  };

  return <CulturallyAdaptiveContent variants={statsVariants} />;
};

export default CulturalStatsSection;