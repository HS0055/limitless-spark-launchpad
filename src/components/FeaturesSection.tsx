import { Card, CardContent } from "@/components/ui/card";
import { Brain, Clock, Zap, Target, Users, TrendingUp } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "Visual Learning",
      description: "Complex business concepts broken down into simple, digestible visuals that actually stick in your memory."
    },
    {
      icon: Clock,
      title: "Quick Lessons",
      description: "5-10 minute lessons that fit into any schedule. Learn during coffee breaks or commutes."
    },
    {
      icon: Zap,
      title: "Instant Application",
      description: "Apply what you learn immediately with practical frameworks and real-world examples."
    },
    {
      icon: Target,
      title: "Focused Content",
      description: "No fluff, no theory overload. Just the essential business knowledge you need to succeed."
    },
    {
      icon: Users,
      title: "Creative-Focused",
      description: "Designed specifically for creative professionals who think visually and work differently."
    },
    {
      icon: TrendingUp,
      title: "Proven Results",
      description: "Join 650+ professionals who've already leveled up their business confidence and skills."
    }
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Why choose <span className="text-primary">Limitless Concepts?</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We've reimagined business education for creative minds who learn best through visual, 
          practical, and engaging content.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card key={index} className="bg-card border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;