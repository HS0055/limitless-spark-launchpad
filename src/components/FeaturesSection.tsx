import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Clock, Zap, Target, Users, TrendingUp } from "lucide-react";
import visualLearningImage from "@/assets/visual-learning-concept.jpg";

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "Visual Learning",
      description: "Complex business concepts broken down into simple, digestible visuals that actually stick in your memory.",
      detail: "Every lesson is designed with infographics, flowcharts, and visual frameworks that make abstract concepts concrete."
    },
    {
      icon: Clock,
      title: "Quick Lessons",
      description: "5-10 minute lessons that fit into any schedule. Learn during coffee breaks or commutes.",
      detail: "Micro-learning approach proven to increase retention and reduce overwhelm for busy professionals."
    },
    {
      icon: Zap,
      title: "Instant Application",
      description: "Apply what you learn immediately with practical frameworks and real-world examples.",
      detail: "Each lesson includes actionable takeaways you can implement in your next business conversation."
    },
    {
      icon: Target,
      title: "Focused Content",
      description: "No fluff, no theory overload. Just the essential business knowledge you need to succeed.",
      detail: "Curated curriculum focusing on the 20% of business knowledge that drives 80% of results."
    },
    {
      icon: Users,
      title: "Creative-Focused",
      description: "Designed specifically for creative professionals who think visually and work differently.",
      detail: "Examples drawn from design, marketing, and creative industries you can actually relate to."
    },
    {
      icon: TrendingUp,
      title: "Proven Results",
      description: "Join 650+ professionals who've already leveled up their business confidence and skills.",
      detail: "Track record of helping creatives land better clients, negotiate higher rates, and grow their businesses."
    }
  ];

  return (
    <section className="content-section bg-gradient-to-b from-background to-muted/10">
      <div className="content-container">
        <div className="section-header">
          <h2 className="section-title">
            Why choose <span className="text-gradient">Limitless Concepts?</span>
          </h2>
          <p className="section-subtitle">
            We've reimagined business education for creative minds who learn best through visual, 
            practical, and engaging content that actually makes sense.
          </p>
        </div>

        <div className="mb-16">
          <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={visualLearningImage} 
              alt="Visual learning concepts and infographics" 
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="text-3xl font-display font-bold mb-2">Transform Complex Into Simple</h3>
                <p className="text-lg opacity-90">Visual frameworks that make business concepts click</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card-elevated p-8 group hover:scale-105 transform transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/20 transition-all duration-300">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-xl font-display font-semibold mb-4 text-center text-foreground">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed text-center mb-4">
                {feature.description}
              </p>
              
              <p className="text-sm text-muted-foreground/80 text-center italic">
                {feature.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm border border-border rounded-full px-6 py-3 mb-6">
            <span className="text-sm text-muted-foreground">🎯 Ready to level up?</span>
          </div>
          <Button className="btn-hero text-lg px-8 py-4">
            Start Your Transformation
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;