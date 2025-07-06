import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";

const PricingSection = () => {
  const features = [
    "Access to all visual business lessons",
    "5-10 minute bite-sized content",
    "Mobile-friendly learning platform",
    "Practical frameworks & templates",
    "Real-world case studies",
    "Community access",
    "Lifetime updates",
    "30-day money-back guarantee"
  ];

  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Start your <span className="text-primary">business transformation</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get instant access to all our visual business lessons and join hundreds of 
          creative professionals building their business confidence.
        </p>
      </div>

      <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20 shadow-accent-glow relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
            <Sparkles className="w-4 h-4" />
            <span>Early Bird</span>
          </div>
        </div>
        
        <CardHeader className="text-center pb-6">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Complete Access
          </h3>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-3xl font-bold text-primary">$37</span>
            <div className="text-left">
              <div className="text-sm text-muted-foreground line-through">$97</div>
              <div className="text-sm text-primary font-semibold">62% OFF</div>
            </div>
          </div>
          <p className="text-muted-foreground">
            One-time payment, lifetime access
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <div className="text-center pt-6">
            <Button variant="hero" className="w-full md:w-auto">
              Get Early-bird Access Now
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Join 650+ creative professionals already learning
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground">
          🔒 Secure payment • 30-day money-back guarantee • Instant access
        </p>
      </div>
    </section>
  );
};

export default PricingSection;