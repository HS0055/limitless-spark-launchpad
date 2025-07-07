import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Users, Star, CheckCircle, ArrowRight, Zap, BarChart3, Briefcase, TrendingUp, BookOpen, GraduationCap, Award, Clock, Eye, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleJoinNow = () => {
    navigate('/dashboard');
  };

  // Psychological urgency stats
  const urgencyStats = [
    { number: "1,247", text: "Professionals enrolled this week", subtext: "Limited seats remaining", color: "text-blue-500" },
    { number: "$45K", text: "Average salary increase", subtext: "Within 6 months completion", color: "text-green-500" },
    { number: "12 hrs", text: "Left for early bird pricing", subtext: "Save 70% today only", color: "text-red-500" }
  ];

  const features = [
    {
      icon: Target,
      title: "Strategic Business Thinking",
      description: "Master the frameworks used by Fortune 500 executives to make million-dollar decisions with confidence"
    },
    {
      icon: BarChart3,
      title: "Financial Intelligence", 
      description: "Understand P&L, cash flow, and financial metrics that separate successful leaders from the rest"
    },
    {
      icon: Users,
      title: "Leadership Psychology",
      description: "Learn the hidden psychology of influence and leadership that top executives use to drive results"
    },
    {
      icon: TrendingUp,
      title: "Growth Strategies",
      description: "Proven methodologies to scale businesses, increase profits, and create sustainable competitive advantages"
    }
  ];

  const benefits = [
    "MBA-level business education without the degree",
    "Real case studies from Fortune 500 companies", 
    "Interactive financial modeling and analysis tools",
    "Personal mentorship from industry executives",
    "Exclusive network of ambitious professionals",
    "Lifetime access to updated content and resources"
  ];

  const testimonials = [
    {
      name: "David Kumar",
      role: "Senior Manager",
      company: "Tech Corp",
      content: "This program gave me the strategic thinking skills that got me promoted to Director level with a 40% salary increase.",
      avatar: "DK",
      rating: 5,
      growth: "+$32K salary increase"
    },
    {
      name: "Lisa Zhang", 
      role: "Entrepreneur",
      company: "Startup Founder",
      content: "The financial intelligence module helped me secure $2M in Series A funding. The ROI calculations were spot-on.",
      avatar: "LZ",
      rating: 5,
      growth: "Raised $2M funding"
    },
    {
      name: "Robert Chen",
      role: "Business Consultant", 
      company: "McKinsey & Co",
      content: "Even as a consultant, I learned frameworks here that I now use with Fortune 500 clients. Absolutely transformative.",
      avatar: "RC",
      rating: 5,
      growth: "Promoted to Principal"
    }
  ];

  return (
    <PublicLayout 
      sectionName="Business Fundamentals" 
      sectionIcon={Target}
      sectionColor="from-blue-500 to-purple-500"
    >
      {/* Psychological Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-indigo-500/10" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            {/* Urgency Badge */}
            <div className="inline-flex items-center bg-red-500/10 text-red-600 px-6 py-3 rounded-full border border-red-500/20 animate-pulse">
              <Clock className="w-5 h-5 mr-2" />
              <span className="font-bold">CAREER ACCELERATION: Limited Time 70% OFF!</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              Think Like a <span className="text-gradient bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">CEO</span>
              <br />
              Get Paid Like <span className="text-gradient bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">One</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              While others struggle with basic business concepts, you'll master the 
              <span className="text-blue-500 font-bold"> strategic frameworks</span> that Fortune 500 executives use to make million-dollar decisions.
            </p>

            {/* Psychological Social Proof */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto my-12">
              {urgencyStats.map((stat, index) => (
                <Card key={index} className="text-center p-6 border-border/30 hover:border-primary/30 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-0">
                    <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.number}</div>
                    <div className="font-semibold mb-1">{stat.text}</div>
                    <div className="text-sm text-muted-foreground">{stat.subtext}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main CTA */}
            <div className="space-y-6">
              <Button 
                onClick={handleJoinNow}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-black text-xl px-12 py-6 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 group animate-pulse"
              >
                <span className="flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 group-hover:animate-bounce" />
                  START YOUR CEO TRANSFORMATION FREE
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              
              <p className="text-sm text-muted-foreground">
                🎓 MBA-Level Education • 💼 No Degree Required • ⚡ Start Today
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Master What <span className="text-blue-500">Top Executives</span> Know
            </h2>
            <p className="text-xl text-muted-foreground">
              The same strategic frameworks taught in $200,000 MBA programs, now accessible to you
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 border-border/30 hover:border-primary/30 transition-all duration-300 hover:scale-105 group">
                <CardContent className="p-0">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories with Growth Stats */}
      <section className="py-20 bg-gradient-to-b from-background via-muted/5 to-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Real Results from <span className="text-green-500">Real Professionals</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              See how business fundamentals transformed these careers in months, not years
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8 border-border/30 hover:border-primary/30 transition-all duration-300 hover:scale-105 group relative overflow-hidden">
                {/* Success Badge */}
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  {testimonial.growth}
                </div>
                
                <CardContent className="p-0">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6 italic text-lg">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final Urgency CTA */}
      <section className="py-20 bg-gradient-to-br from-red-500/5 via-background to-orange-500/5 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center bg-red-500/10 text-red-600 px-6 py-3 rounded-full border border-red-500/20">
              <Clock className="w-5 h-5 mr-2" />
              <span className="font-bold">Your Competition Is Already Learning</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-display font-bold leading-tight">
              Don't Let This
              <br />
              <span className="text-gradient">Moment Pass</span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every day you wait, someone else is getting the promotion, the raise, or starting the business you've been dreaming about. 
              Your future self will thank you for starting today.
            </p>
          </div>

          <Button 
            onClick={handleJoinNow}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-xl px-12 py-6 rounded-2xl shadow-2xl hover:shadow-red-500/25 transition-all duration-300 group animate-pulse"
          >
            <span className="flex items-center gap-3">
              <Award className="w-6 h-6 group-hover:animate-bounce" />
              TRANSFORM YOUR CAREER NOW - FREE
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
          
          <p className="text-sm text-muted-foreground">
            ⚡ Instant access • 🎯 No risk • 🚀 Start your transformation today
          </p>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Index;
