import { Button } from "@/components/ui/button";
import { Star, Play } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import heroImage from "@/assets/business-education-hero.jpg";
import { useTranslation } from "react-i18next";

const HeroSection = () => {
  const { t } = useTranslation('hero');
  return (
    <section className="content-section pt-24">
      <div className="content-container">
        <div className="section-header">
          <div className="inline-flex items-center bg-primary/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-primary/20">
            <span className="text-sm font-semibold text-primary">🏆 {t('badge')}</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-8 leading-[1.1] tracking-tight">
            {t('title')}
            <br />
            <span className="text-gradient bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">{t('titleHighlight')}</span>
          </h1>
          
          <div className="max-w-4xl mx-auto space-y-6 mb-12">
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium">
              {t('subtitle')}
            </p>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {t('description', { highlight: t('descriptionHighlight') })}
            </p>
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground/80 pt-4">
              <div className="flex items-center gap-2 bg-card/50 rounded-full px-4 py-2 border border-border">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                <span>{t('comingSoon')}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button className="btn-hero text-lg px-10 py-5 h-auto font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              🚀 {t('joinLeague')}
            </Button>
            <Button variant="outline" size="lg" className="text-muted-foreground border-2 border-muted hover:border-primary hover:text-primary px-8 py-3 h-auto font-medium transition-all duration-300 hover:bg-primary/5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                {t('watchPreview')}
              </div>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground mb-20">
            <div className="flex items-center space-x-3 bg-card/30 backdrop-blur-sm rounded-full px-6 py-3 border border-border">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background shadow-sm" />
                ))}
              </div>
              <span className="font-medium">{t('professionals')}</span>
            </div>
            <div className="w-px h-6 bg-border hidden sm:block"></div>
            <div className="flex items-center gap-2 bg-card/30 backdrop-blur-sm rounded-full px-6 py-3 border border-border">
              <span className="text-lg">⚡</span>
              <span className="font-medium">{t('lessons')}</span>
            </div>
            <div className="w-px h-6 bg-border hidden sm:block"></div>
            <div className="flex items-center gap-2 bg-card/30 backdrop-blur-sm rounded-full px-6 py-3 border border-border">
              <span className="text-lg">📊</span>
              <span className="font-medium">{t('visual')}</span>
            </div>
            <div className="w-px h-6 bg-border hidden sm:block"></div>
            <div className="flex items-center gap-2 bg-card/30 backdrop-blur-sm rounded-full px-6 py-3 border border-border">
              <span className="text-lg">🎯</span>
              <span className="font-medium">{t('noTheory')}</span>
            </div>
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto mb-20">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-card via-card to-muted shadow-2xl animate-float border border-border/50">
            <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent z-10"></div>
            <OptimizedImage
              src={heroImage} 
              alt={t('workspaceAlt')} 
              className="w-full h-auto aspect-video object-cover"
              enableLazyLoading={false}
              enableWebP={true}
            />
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <Button size="lg" className="rounded-full w-24 h-24 bg-primary/90 backdrop-blur-sm hover:bg-primary shadow-2xl hover:shadow-accent-glow-strong animate-pulse-glow border-4 border-white/20 transition-all duration-300 hover:scale-110">
                <Play className="w-10 h-10 ml-1" />
              </Button>
            </div>
            {/* Enhanced floating elements */}
            <div className="absolute top-6 right-6 bg-background/90 backdrop-blur-md rounded-xl px-4 py-3 text-sm font-semibold border border-border shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                📈 {t('businessGrowth')}
              </div>
            </div>
            <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur-md rounded-xl px-4 py-3 text-sm font-semibold border border-border shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                🎯 {t('visualLearning')}
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof & Stats */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-3xl font-bold text-primary mb-2">4.97</p>
            <p className="text-sm text-muted-foreground font-medium">{t('averageRating')}</p>
          </div>
          
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <p className="text-4xl font-bold text-primary mb-3">650+</p>
            <p className="text-sm text-muted-foreground font-medium mb-4">{t('professionalsTransformed')}</p>
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
            <p className="text-sm text-muted-foreground font-medium">{t('lessonLength')}</p>
            <p className="text-xs text-muted-foreground mt-2 opacity-80">{t('perfectSchedule')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;