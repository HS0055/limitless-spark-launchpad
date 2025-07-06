import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Shield, PieChart, BarChart3, Calculator } from "lucide-react";

const InvestmentBasics = () => {
  const concepts = [
    {
      icon: TrendingUp,
      title: "Compound Interest",
      description: "Learn how your money grows exponentially over time",
      visual: "📈"
    },
    {
      icon: PieChart,
      title: "Portfolio Diversification", 
      description: "Spread risk across different asset classes",
      visual: "🥧"
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Balance potential returns with acceptable risk levels",
      visual: "🛡️"
    },
    {
      icon: BarChart3,
      title: "Market Analysis",
      description: "Read charts and understand market trends",
      visual: "📊"
    },
    {
      icon: DollarSign,
      title: "Asset Allocation",
      description: "Strategic distribution of investments",
      visual: "💰"
    },
    {
      icon: Calculator,
      title: "ROI Calculation",
      description: "Measure and compare investment performance",
      visual: "🧮"
    }
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Investment <span className="text-primary">Made Simple</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          Demystify complex investment concepts with our visual approach. Perfect for creative professionals who want to grow their wealth intelligently.
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <span>✨ No jargon</span>
          <span>•</span>
          <span>📊 Visual explanations</span>
          <span>•</span>
          <span>🎯 Practical examples</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {concepts.map((concept, index) => (
          <Card key={index} className="bg-card border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg group text-center">
            <CardContent className="p-6">
              <div className="text-4xl mb-4">{concept.visual}</div>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <concept.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-foreground">
                {concept.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {concept.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center bg-card rounded-2xl p-8 border border-border">
        <h3 className="text-2xl font-bold mb-4">
          Ready to start your <span className="text-primary">investment journey?</span>
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Join thousands of creative professionals who've taken control of their financial future
        </p>
        <Button variant="hero" size="lg">
          Start Learning Today
        </Button>
      </div>
    </section>
  );
};

export default InvestmentBasics;