import { useLanguage } from '@/contexts/LanguageContext';
import CulturallyAdaptiveContent, { ContentVariant } from './CulturallyAdaptiveContent';
import { Target, Trophy, Users, BookOpen, Star } from 'lucide-react';

export const CulturalLeagueHero = () => {
  const { language } = useLanguage();
  
  const heroVariants: ContentVariant = {
    en: (
      <div className="section-header">
        <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-accent-secondary/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-primary/20 shadow-lg animate-scale-in">
          <Target className="w-4 h-4 text-primary mr-2" />
          <span className="text-sm font-semibold text-gradient">🏆 Learning Programs</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-8 leading-[1.1] tracking-tight animate-slide-up">
          Choose Your
          <br />
          <span className="text-gradient">Learning League</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium max-w-4xl mx-auto mb-12 animate-fade-in">
          Join specialized programs designed to accelerate your business knowledge through 
          <span className="text-primary font-bold"> visual learning</span> and practical application.
        </p>
      </div>
    ),
    hy: (
      <div className="section-header">
        <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-accent-secondary/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-primary/20 shadow-lg animate-scale-in">
          <Target className="w-4 h-4 text-primary mr-2" />
          <span className="text-sm font-semibold text-gradient">🏆 Ուսուցման ծրագրեր</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-10 leading-[1.2] tracking-wide animate-slide-up">
          Ընտրիր քո
          <br />
          <span className="text-gradient">Ուսուցման լիգան</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium max-w-4xl mx-auto mb-14 animate-fade-in">
          Միացիր մասնագիտական ծրագրերին, որոնք նախագծված են արագացնելու քո բիզնես գիտելիքները 
          <span className="text-primary font-bold"> տեսողական ուսուցման</span> և գործնական կիրառման միջոցով։
        </p>
      </div>
    ),
    ru: (
      <div className="section-header">
        <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-accent-secondary/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-primary/20 shadow-lg animate-scale-in">
          <Target className="w-4 h-4 text-primary mr-2" />
          <span className="text-sm font-semibold text-gradient">🏆 Обучающие программы</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-8 leading-[1.1] tracking-tight animate-slide-up">
          Выбери свою
          <br />
          <span className="text-gradient">Обучающую лигу</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium max-w-4xl mx-auto mb-12 animate-fade-in">
          Присоединяйся к специализированным программам, созданным для ускорения твоих бизнес-знаний через 
          <span className="text-primary font-bold"> визуальное обучение</span> и практическое применение.
        </p>
      </div>
    )
  };

  return <CulturallyAdaptiveContent variants={heroVariants} />;
};

export const CulturalLeagueStats = () => {
  const { language } = useLanguage();
  
  const statsVariants: ContentVariant = {
    en: (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-20">
        {[
          { number: "3", label: "Active Programs", icon: Trophy, color: "text-primary" },
          { number: "1,350+", label: "Students Enrolled", icon: Users, color: "text-accent-secondary" },
          { number: "92+", label: "Total Lessons", icon: BookOpen, color: "text-accent-tertiary" },
          { number: "4.95", label: "Average Rating", icon: Star, color: "text-primary" }
        ].map((stat, index) => (
          <div 
            key={index} 
            className="text-center p-6 rounded-2xl card-glass hover-lift hover-glow group animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold text-gradient mb-2">{stat.number}</div>
            <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    ),
    hy: (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-20">
        {[
          { number: "3", label: "Ակտիվ ծրագրեր", icon: Trophy, color: "text-primary" },
          { number: "1,350+", label: "Գրանցված ուսանողներ", icon: Users, color: "text-accent-secondary" },
          { number: "92+", label: "Ընդհանուր դասեր", icon: BookOpen, color: "text-accent-tertiary" },
          { number: "4.95", label: "Միջին գնահատական", icon: Star, color: "text-primary" }
        ].map((stat, index) => (
          <div 
            key={index} 
            className="text-center p-6 rounded-2xl card-glass hover-lift hover-glow group animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold text-gradient mb-2">{stat.number}</div>
            <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    ),
    ru: (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-20">
        {[
          { number: "3", label: "Активные программы", icon: Trophy, color: "text-primary" },
          { number: "1,350+", label: "Зарегистрированных студентов", icon: Users, color: "text-accent-secondary" },
          { number: "92+", label: "Всего уроков", icon: BookOpen, color: "text-accent-tertiary" },
          { number: "4.95", label: "Средний рейтинг", icon: Star, color: "text-primary" }
        ].map((stat, index) => (
          <div 
            key={index} 
            className="text-center p-6 rounded-2xl card-glass hover-lift hover-glow group animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold text-gradient mb-2">{stat.number}</div>
            <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    )
  };

  return <CulturallyAdaptiveContent variants={statsVariants} />;
};

export const CulturalProgramsHeader = () => {
  const { language } = useLanguage();
  
  const headerVariants: ContentVariant = {
    en: (
      <div className="section-header mb-16">
        <h2 className="section-title animate-slide-up">
          Available <span className="text-gradient">Programs</span>
        </h2>
        <p className="section-subtitle animate-fade-in">
          Choose from our carefully crafted learning programs, each designed to build specific business skills
        </p>
      </div>
    ),
    hy: (
      <div className="section-header mb-16">
        <h2 className="section-title animate-slide-up">
          Հասանելի <span className="text-gradient">ծրագրեր</span>
        </h2>
        <p className="section-subtitle animate-fade-in">
          Ընտրիր մեր ուշադիր մշակված ուսուցման ծրագրերից, որոնցից յուրաքանչյուրը նախագծված է կոնկրետ բիզնես հմտություններ զարգացնելու համար
        </p>
      </div>
    ),
    ru: (
      <div className="section-header mb-16">
        <h2 className="section-title animate-slide-up">
          Доступные <span className="text-gradient">программы</span>
        </h2>
        <p className="section-subtitle animate-fade-in">
          Выбирай из наших тщательно разработанных обучающих программ, каждая из которых создана для развития конкретных бизнес-навыков
        </p>
      </div>
    )
  };

  return <CulturallyAdaptiveContent variants={headerVariants} />;
};

export default { CulturalLeagueHero, CulturalLeagueStats, CulturalProgramsHeader };