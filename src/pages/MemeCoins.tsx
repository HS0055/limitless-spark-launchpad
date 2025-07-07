import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, Star, CheckCircle, ArrowRight, Zap, Target, BarChart3, Rocket, DollarSign, Brain, Eye, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MemeCoins = () => {
  const navigate = useNavigate();

  const handleJoinNow = () => {
    navigate('/dashboard');
  };

  // Psychological stats for urgency
  const urgencyStats = [
    { number: "847", text: "Traders joined today", subtext: "Limited spots remaining", color: "text-green-500" },
    { number: "₹2.4L", text: "Average monthly gains", subtext: "Last 30 days verified", color: "text-blue-500" },
    { number: "6 hrs", text: "Left for early access", subtext: "Price increases after", color: "text-red-500" }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: "AI-Powered Predictions",
      description: "Get ahead with machine learning algorithms that analyze 1000+ data points to predict meme coin movements before they happen"
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics", 
      description: "Live market data, sentiment analysis, and whale tracking - all the tools you need to make profitable decisions instantly"
    },
    {
      icon: Users,
      title: "Elite Trader Community",
      description: "Join 10,000+ successful traders sharing strategies, tips, and exclusive insider insights you won't find anywhere else"
    },
    {
      icon: Target,
      title: "Smart Alert System",
      description: "Never miss a pump again with our intelligent alerts that notify you seconds before major price movements"
    }
  ];

  const benefits = [
    "Access to exclusive meme coin analysis and research",
    "Real-time trading signals and market alerts", 
    "Community of 10,000+ active meme coin traders",
    "Educational content and trading strategies",
    "Portfolio tracking and performance analytics",
    "Daily market reports and trend analysis"
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Crypto Trader",
      content: "This platform helped me identify DOGE before its 300% run. The community insights are invaluable!",
      avatar: "AC",
      rating: 5
    },
    {
      name: "Sarah Miller", 
      role: "DeFi Investor",
      content: "Finally, a place where meme coin trading is taken seriously. The analytics are top-notch.",
      avatar: "SM",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Portfolio Manager", 
      content: "The real-time alerts saved me from major losses and helped me catch the SHIB surge.",
      avatar: "MR",
      rating: 5
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Traders", icon: Users },
    { number: "2,847", label: "Coins Tracked", icon: BarChart3 },
    { number: "94.7%", label: "Success Rate", icon: Target },
    { number: "$45.2B", label: "Total Volume", icon: TrendingUp }
  ];

  return (
    <PublicLayout 
      sectionName="Meme Coin Mastery" 
      sectionIcon={TrendingUp}
      sectionColor="from-accent-secondary to-accent-tertiary"
    >
      
      {/* Hero Section */}
      <section className="content-section pt-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-accent-secondary/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-tertiary/20 rounded-full blur-3xl animate-float-delayed"></div>
        </div>
        
        <div className="content-container">
          <div className="section-header text-center">
            <div className="inline-flex items-center bg-gradient-to-r from-accent-secondary/10 to-accent-tertiary/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-accent-secondary/20 shadow-lg animate-scale-in">
              <Zap className="w-4 h-4 text-accent-secondary mr-2" />
              <span className="text-sm font-semibold text-gradient">🚀 #1 Meme Coin Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-8 leading-[1.1] tracking-tight animate-slide-up">
              Master Meme Coin
              <br />
              <span className="text-gradient">Trading Like A Pro</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium max-w-4xl mx-auto mb-12 animate-fade-in">
              Join 10,000+ successful traders who use our platform to 
              <span className="text-accent-secondary font-bold"> identify the next 100x meme coin</span> before it explodes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up">
              <Button 
                onClick={handleJoinNow}
                className="btn-hero text-lg px-8 py-6 font-bold shadow-2xl group"
              >
                <span className="flex items-center gap-2">
                  Join 10,000+ Traders FREE
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <Button 
                variant="outline" 
                className="text-lg px-8 py-6 font-semibold border-2 hover-glow"
              >
                Watch Success Stories
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center p-6 rounded-2xl card-glass hover-lift hover-glow group animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-accent-secondary/20 to-accent-tertiary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <stat.icon className="w-6 h-6 text-accent-secondary" />
                  </div>
                  <div className="text-3xl font-bold text-gradient mb-2">{stat.number}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="content-section bg-gradient-to-b from-background via-muted/5 to-background">
        <div className="content-container">
          <div className="section-header mb-16 text-center">
            <h2 className="section-title animate-slide-up">
              Why Choose <span className="text-gradient">Our Platform?</span>
            </h2>
            <p className="section-subtitle animate-fade-in">
              Everything you need to succeed in meme coin trading, all in one place
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-16">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="card-elevated hover-lift text-center group animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent-secondary/20 to-accent-tertiary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="w-8 h-8 text-accent-secondary" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gradient-secondary">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="content-section">
        <div className="content-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-up">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 leading-tight">
                What You'll Get
                <br />
                <span className="text-gradient">Inside Our Platform</span>
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-4 p-4 rounded-xl card-glass animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CheckCircle className="w-6 h-6 text-accent-secondary flex-shrink-0" />
                    <span className="text-lg font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button 
                onClick={handleJoinNow}
                className="btn-hero text-lg px-8 py-6 font-bold mt-8 w-full sm:w-auto group"
              >
                <span className="flex items-center gap-2">
                  Start Trading Today - FREE
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>

            <div className="grid gap-6 animate-slide-up">
              {/* Sample Trading Cards */}
              <Card className="card-elevated">
                <CardHeader className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">DOGE/USD</CardTitle>
                      <p className="text-sm text-muted-foreground">Signal Alert</p>
                    </div>
                    <Badge className="bg-green-500 text-white">BUY</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Entry: $0.087</span>
                      <span className="text-green-500">+15.2%</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Target: $0.12 | Stop: $0.08
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">SHIB/USD</CardTitle>
                      <p className="text-sm text-muted-foreground">Market Analysis</p>
                    </div>
                    <Badge variant="outline">WATCH</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Price: $0.000009</span>
                      <span className="text-blue-500">+8.7%</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Volume spike detected
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="content-section bg-gradient-to-b from-background via-muted/5 to-background">
        <div className="content-container">
          <div className="section-header mb-16 text-center">
            <h2 className="section-title animate-slide-up">
              Success <span className="text-gradient">Stories</span>
            </h2>
            <p className="section-subtitle animate-fade-in">
              See what our community members are saying about their results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="card-elevated hover-lift animate-scale-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-accent-tertiary fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-secondary to-accent-tertiary flex items-center justify-center text-white font-bold">
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

      {/* Final CTA Section */}
      <section className="content-section">
        <div className="content-container">
          <div className="text-center card-elevated p-16 rounded-3xl bg-gradient-to-br from-accent-secondary/5 to-accent-tertiary/5 border border-accent-secondary/10">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 animate-slide-up">
              Ready to Start Your
              <br />
              <span className="text-gradient">Meme Coin Journey?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
              Join thousands of traders already profiting from meme coin opportunities. 
              Start your free account today and get instant access to our platform.
            </p>
            <Button 
              onClick={handleJoinNow}
              className="btn-hero text-xl px-12 py-8 font-bold shadow-2xl group animate-scale-in"
            >
              <span className="flex items-center gap-3">
                Join FREE - No Credit Card Required
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              ✓ Instant Access ✓ No Setup Fees ✓ Cancel Anytime
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default MemeCoins;