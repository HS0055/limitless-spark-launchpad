import { Button } from "@/components/ui/button";
import { Star, Play } from "lucide-react";
import heroImage from "@/assets/business-hero.jpg";

const HeroSection = () => {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Gain business confidence with quick
          <br />
          <span className="text-primary">& visual lessons</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-2 max-w-2xl mx-auto">
          Is a lack of technical business knowledge holding you back?
        </p>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          We made critical concepts simple & visual so you can{" "}
          <span className="text-primary font-semibold">10x your business skills</span>.
        </p>
        
        <Button variant="hero" className="mb-16">
          Get Early-bird Access
        </Button>
      </div>

      <div className="relative max-w-2xl mx-auto mb-12">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-card to-muted">
          <img 
            src={heroImage} 
            alt="Business education preview" 
            className="w-full h-auto aspect-video object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Button size="lg" className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90 shadow-accent-glow">
              <Play className="w-6 h-6 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          4.97 based on 233 reviews
        </p>
        
        <div className="flex items-center justify-center space-x-2">
          <div className="flex -space-x-2">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background"
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground ml-2">
            +650 creative professionals
          </span>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-lg font-semibold mb-8">
          <span className="text-muted-foreground">More than </span>
          <span className="text-primary">650 creative professionals</span>
          <span className="text-muted-foreground"> have</span>
          <br />
          <span className="text-primary font-bold">already leveled up with Limitless Concepts</span>
        </p>
      </div>
    </section>
  );
};

export default HeroSection;