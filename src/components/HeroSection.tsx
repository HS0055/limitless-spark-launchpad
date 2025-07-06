import { Button } from "@/components/ui/button";
import { Star, Play } from "lucide-react";
import heroImage from "@/assets/business-education-hero.jpg";

const HeroSection = () => {
  return (
    <section className="content-section pt-24">
      <div className="content-container">
        <div className="section-header">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight">
            Gain business confidence with
            <br />
            <span className="text-gradient">quick & visual lessons</span>
          </h1>
          
          <div className="max-w-4xl mx-auto space-y-4 mb-8">
            <p className="text-xl md:text-2xl text-muted-foreground">
              Is a lack of technical business knowledge holding you back?
            </p>
            <p className="text-lg md:text-xl text-muted-foreground">
              We made critical concepts simple & visual so you can{" "}
              <span className="text-primary font-semibold">10x your business skills</span> and finally feel confident in any business conversation.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button className="btn-hero text-lg px-8 py-4">
              🚀 Get Early-bird Access
            </Button>
            <Button variant="outline" size="lg" className="text-muted-foreground border-muted hover:border-primary hover:text-primary">
              Watch Preview
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-16">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent border border-background" />
                ))}
              </div>
              <span>650+ professionals</span>
            </div>
            <div className="w-px h-4 bg-border hidden sm:block"></div>
            <span>⚡ 5-minute lessons</span>
            <div className="w-px h-4 bg-border hidden sm:block"></div>
            <span>📊 100% visual</span>
            <div className="w-px h-4 bg-border hidden sm:block"></div>
            <span>🎯 No boring theory</span>
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto mb-16">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-card to-muted shadow-2xl animate-float">
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent z-10"></div>
            <img 
              src={heroImage} 
              alt="Professional business education workspace" 
              className="w-full h-auto aspect-video object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <Button size="lg" className="rounded-full w-20 h-20 bg-primary hover:bg-primary/90 shadow-accent-glow hover:shadow-accent-glow-strong animate-pulse-glow">
                <Play className="w-8 h-8 ml-1" />
              </Button>
            </div>
            {/* Floating elements */}
            <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium">
              📈 Business Growth
            </div>
            <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium">
              🎯 Visual Learning
            </div>
          </div>
        </div>

        {/* Social Proof & Stats */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border">
            <div className="flex items-center justify-center space-x-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-2xl font-bold text-primary mb-1">4.97</p>
            <p className="text-sm text-muted-foreground">Average rating from 233 reviews</p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border">
            <p className="text-3xl font-bold text-primary mb-1">650+</p>
            <p className="text-sm text-muted-foreground">Creative professionals transformed</p>
            <div className="flex justify-center -space-x-2 mt-2">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent border border-background"
                />
              ))}
            </div>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border">
            <p className="text-3xl font-bold text-primary mb-1">5 min</p>
            <p className="text-sm text-muted-foreground">Average lesson length</p>
            <p className="text-xs text-muted-foreground mt-1">Perfect for busy schedules</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;