import { Button } from "@/components/ui/button";
import { Star, Play } from "lucide-react";
import heroImage from "@/assets/business-education-hero.jpg";
import { CulturalHeroContent } from "@/components/CulturallyAdaptiveContent";
import { CulturalTrustIndicators } from "@/components/CulturalTrustIndicators";
import { CulturalStatsSection } from "@/components/CulturalStatsSection";
import { CulturalFloatingElements } from "@/components/CulturalFloatingElements";

const HeroSection = () => {
  return (
    <section className="content-section pt-24">
      <div className="content-container">
        <div className="section-header">
          <CulturalHeroContent />
        </div>

        <CulturalTrustIndicators />

        <div className="relative max-w-5xl mx-auto mb-20">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-card via-card to-muted shadow-2xl animate-float border border-border/50">
            <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent z-10"></div>
            <img 
              src={heroImage} 
              alt="Professional business education workspace" 
              className="w-full h-auto aspect-video object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <Button size="lg" className="rounded-full w-24 h-24 bg-primary/90 backdrop-blur-sm hover:bg-primary shadow-2xl hover:shadow-accent-glow-strong animate-pulse-glow border-4 border-white/20 transition-all duration-300 hover:scale-110">
                <Play className="w-10 h-10 ml-1" />
              </Button>
            </div>
            <CulturalFloatingElements />
          </div>
        </div>

        {/* Social Proof & Stats */}
        <CulturalStatsSection />
      </div>
    </section>
  );
};

export default HeroSection;