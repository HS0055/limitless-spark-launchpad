import Header from "@/components/Header";
import CompanyLogos from "@/components/CompanyLogos";
import UpcomingLeagues from "@/components/UpcomingLeagues";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Users, BookOpen, Star, Zap, Clock, Award, TrendingUp, CheckCircle, ArrowRight, Play, Sparkles, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  const stats = [
    { number: "5+", label: "Learning Leagues", icon: Trophy, color: "text-accent-secondary" },
    { number: "650+", label: "Active Learners", icon: Users, color: "text-primary" },
    { number: "4.97", label: "Average Rating", icon: Star, color: "text-accent-tertiary" },
    { number: "5 min", label: "Lesson Length", icon: Clock, color: "text-accent-secondary" }
  ];

  const features = [
    {
      icon: Target,
      title: "Choose Your League", 
      description: "Start with Business Fundamentals or explore specialized leagues tailored to your career goals and ambitions.",
      gradient: "from-primary/20 to-accent/10"
    },
    {
      icon: Zap,
      title: "Learn Visually", 
      description: "Master complex concepts through engaging 5-minute visual lessons designed for maximum retention and understanding.",
      gradient: "from-accent-secondary/20 to-accent-tertiary/10"
    },
    {
      icon: Award,
      title: "Unlock & Achieve", 
      description: "Complete leagues, earn prestigious certificates, and unlock new learning paths as you advance through TopOne Academy.",
      gradient: "from-accent-tertiary/20 to-primary/10"
    }
  ];

  const benefits = [
    "🎯 100% Visual Learning - No boring theory",
    "⚡ 5-Minute Lessons - Perfect for busy schedules", 
    "🏆 Gamified Experience - Unlock achievements",
    "📊 Progress Tracking - See your growth",
    "🤝 Community Access - Learn with peers",
    "📱 Mobile Optimized - Learn anywhere"
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Enhanced Hero Section */}
      <section className="content-section pt-24 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-secondary/10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>
        
        <div className="content-container">
          <div className="section-header">
            {/* Enhanced badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-accent-secondary/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-primary/20 shadow-lg animate-scale-in">
              <Sparkles className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-semibold text-gradient">🏆 Business Fundamentals League</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-8 leading-[1.1] tracking-tight animate-slide-up">
              Master business skills with
              <br />
              <span className="text-gradient">TopOne Academy</span>
            </h1>
            
            <div className="max-w-4xl mx-auto space-y-6 mb-12 animate-fade-in">
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium">
                Join the Business Fundamentals League and gain confidence through 
                <span className="text-primary font-bold"> visual learning</span>
              </p>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Transform your business skills with bite-sized visual lessons designed to make complex concepts simple and actionable.
              </p>
            </div>

            {/* Benefits list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto mb-12">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 bg-card-glass rounded-xl px-4 py-3 hover-lift animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-muted-foreground">{benefit.replace(/^[^\s]+\s/, '')}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button className="btn-hero text-lg px-12 py-6 h-auto font-bold shadow-2xl hover:shadow-xl group">
                <span className="flex items-center gap-3">
                  🚀 Join Business League
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <Button className="btn-outline-enhanced text-lg px-8 py-4 h-auto font-semibold group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary" />
                  </div>
                  <span>Watch Preview</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Button>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-20">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center p-6 rounded-2xl card-glass hover-lift hover-glow group animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-gradient mb-2">{stat.number}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CompanyLogos />
      <UpcomingLeagues />
      
      {/* Enhanced How It Works */}
      <section className="content-section bg-gradient-to-b from-background via-muted/5 to-background relative">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-0 w-72 h-72 bg-accent-secondary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="content-container">
          <div className="section-header">
            <h2 className="section-title animate-slide-up">
              How <span className="text-gradient">TopOne Academy</span> Works
            </h2>
            <p className="section-subtitle animate-fade-in">
              A structured approach to mastering business skills through visual learning and practical application
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="card-elevated p-8 text-center group hover-lift animate-scale-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-0">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-4 text-gradient-secondary">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Process Flow */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 bg-card-glass rounded-2xl p-6 hover-lift">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/10 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-primary">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Sign Up</h4>
                <p className="text-sm text-muted-foreground">Create your account</p>
              </div>
            </div>
            
            <ArrowRight className="w-6 h-6 text-primary hidden md:block" />
            
            <div className="flex items-center gap-4 bg-card-glass rounded-2xl p-6 hover-lift">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-secondary/20 to-accent-tertiary/10 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-accent-secondary">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Choose League</h4>
                <p className="text-sm text-muted-foreground">Pick your learning path</p>
              </div>
            </div>
            
            <ArrowRight className="w-6 h-6 text-primary hidden md:block" />
            
            <div className="flex items-center gap-4 bg-card-glass rounded-2xl p-6 hover-lift">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-tertiary/20 to-primary/10 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-accent-tertiary">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Start Learning</h4>
                <p className="text-sm text-muted-foreground">Begin your journey</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Home;