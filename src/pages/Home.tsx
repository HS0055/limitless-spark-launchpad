import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTranslation } from "@/contexts/TranslationContext";
import { Button } from "@/components/ui/button";
import { 
  Trophy, Target, Users, Star, Zap, Clock, Award, CheckCircle, 
  ArrowRight, Play, Sparkles, ChevronRight, Rocket, Brain, 
  TrendingUp, Globe, Shield, Heart, Eye, MessageCircle, 
  BarChart3, LineChart, PieChart, DollarSign, Briefcase,
  BookOpen, GraduationCap, Medal, Crown, Gift, Lightbulb
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MarketingLayout from '@/components/MarketingLayout';
// import { Scene3D } from '@/components/3D/Scene3D'; // Temporarily disabled
import { InteractiveCard } from '@/components/InteractiveCard';
import { AIVisualGenerator } from '@/components/AIVisualGenerator';

const Home = () => {
  const { user, loading } = useAuth();
  const { translate } = useTranslation();
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      // Don't redirect from home - let users see landing page
    }
  }, [user, loading, navigate]);

  // PERFORMANCE FIX: Throttle mouse tracking and scroll events
  useEffect(() => {
    let animationFrame: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrame) return; // Skip if animation frame is pending
      
      animationFrame = requestAnimationFrame(() => {
        setMousePosition({ 
          x: (e.clientX / window.innerWidth) * 2 - 1,
          y: (e.clientY / window.innerHeight) * 2 - 1
        });
        animationFrame = null;
      });
    };

    let scrollTimeout: number | null = null;
    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        setScrollY(window.scrollY);
      }, 16); // Throttle to ~60fps
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleGetStarted = () => {
    navigate('/league');
  };

  const features = [
    {
      icon: Target,
      title: "Visual Learning Revolution", 
      description: "Master complex business concepts through stunning visual content designed by learning experts and cognitive scientists.",
      gradient: "from-primary/20 to-accent/10"
    },
    {
      icon: Zap,
      title: "Micro-Learning Magic", 
      description: "Transform your career with bite-sized 5-minute lessons that fit perfectly into your busy professional schedule.",
      gradient: "from-accent-secondary/20 to-accent-tertiary/10"
    },
    {
      icon: Award,
      title: "Gamified Achievement", 
      description: "Unlock leagues, earn prestigious certificates, and build an impressive professional portfolio that stands out.",
      gradient: "from-accent-tertiary/20 to-primary/10"
    }
  ];

  const stats = [
    { 
      number: "10,000+", 
      label: "Success Stories", 
      icon: Users, 
      color: "text-primary",
      description: "Professionals transformed"
    },
    { 
      number: "4.97★", 
      label: "Expert Rating", 
      icon: Star, 
      color: "text-accent-tertiary",
      description: "Based on 2,847 reviews"
    },
    { 
      number: "5 min", 
      label: "Average Lesson", 
      icon: Clock, 
      color: "text-accent-secondary",
      description: "Perfect for busy schedules"
    },
    { 
      number: "92%", 
      label: "Career Growth", 
      icon: TrendingUp, 
      color: "text-primary",
      description: "Within 6 months"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Marketing Director",
      company: "TechCorp",
      content: "TopWan Academy completely transformed my approach to business. The visual learning method made complex concepts click instantly.",
      avatar: "SC",
      rating: 5,
      growth: "+$25K salary increase"
    },
    {
      name: "Marcus Rodriguez", 
      role: "Startup Founder",
      company: "InnovateLab",
      content: "From zero business knowledge to running a profitable startup. The structured leagues gave me exactly what I needed.",
      avatar: "MR",
      rating: 5,
      growth: "Launched successful startup"
    },
    {
      name: "Emily Watson",
      role: "Business Consultant",
      company: "Strategic Plus",
      content: "The gamified approach kept me engaged like no other platform. I actually looked forward to learning every day.",
      avatar: "EW", 
      rating: 5,
      growth: "Promoted to Senior Consultant"
    }
  ];

  const benefits = [
    { icon: Brain, text: "100% Visual Learning - No boring theory", color: "text-primary" },
    { icon: Zap, text: "5-Minute Lessons - Perfect for busy professionals", color: "text-accent-secondary" },
    { icon: Trophy, text: "Gamified Experience - Unlock achievements", color: "text-accent-tertiary" },
    { icon: BarChart3, text: "Progress Tracking - See your growth", color: "text-primary" },
    { icon: Users, text: "Expert Community - Learn with industry leaders", color: "text-accent-secondary" },
    { icon: Shield, text: "Lifetime Access - Learn at your own pace", color: "text-accent-tertiary" }
  ];

  return (
    <MarketingLayout>
      {/* Ultra-Modern Hero Section with 3D Elements */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at ${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%, 
              hsl(160 100% 45% / 0.1) 0%, 
              transparent 50%),
            radial-gradient(circle at ${30 - mousePosition.x * 5}% ${70 - mousePosition.y * 5}%, 
              hsl(280 100% 70% / 0.08) 0%, 
              transparent 50%),
            radial-gradient(circle at ${80 + mousePosition.x * 8}% ${20 + mousePosition.y * 8}%, 
              hsl(45 100% 65% / 0.06) 0%, 
              transparent 50%)
          `
        }}
      >
        {/* Gradient Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-secondary/5 animate-pulse" />
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 content-container text-center">
          {/* Ultra-Modern Badge */}
          <div 
            className="inline-flex items-center bg-gradient-to-r from-primary/10 to-accent-secondary/10 backdrop-blur-xl rounded-full px-8 py-4 mb-12 border border-primary/20 shadow-2xl animate-scale-in group cursor-pointer hover:scale-105 transition-all duration-500"
            style={{
              transform: `translateY(${scrollY * 0.1}px) rotateX(${mousePosition.y * 2}deg)`,
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                <Crown className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent-secondary bg-clip-text text-transparent">
                🏆 #1 Business Learning Platform
              </span>
              <div className="w-6 h-6 bg-accent-secondary/20 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-3 h-3 text-accent-secondary" />
              </div>
            </div>
          </div>
          
          {/* Headline with 3D Effect */}
          <h1 
            className="text-6xl md:text-7xl lg:text-8xl font-display font-black mb-8 leading-[0.9] tracking-tight animate-slide-up"
            style={{
              background: `linear-gradient(135deg, 
                hsl(var(--primary)), 
                hsl(var(--accent-secondary)), 
                hsl(var(--accent-tertiary))
              )`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              transform: `perspective(1000px) rotateX(${mousePosition.y * 1}deg) rotateY(${mousePosition.x * 1}deg)`,
              textShadow: `
                0 0 40px hsl(var(--primary) / 0.3),
                0 0 80px hsl(var(--accent-secondary) / 0.2)
              `
            }}
          >
            Master Business
            <br />
            <span className="relative">
              Like a
              <span className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent-secondary/20 blur-xl animate-pulse" />
              <span className="relative"> Pro</span>
            </span>
          </h1>
          
          {/* Subheadline */}
          <p 
            className="text-2xl md:text-3xl text-muted-foreground leading-relaxed font-medium max-w-5xl mx-auto mb-16 animate-fade-in"
            style={{
              animationDelay: '0.3s',
              transform: `translateZ(${mousePosition.y * 5}px)`
            }}
          >
            Join <span className="text-primary font-bold">10,000+ professionals</span> who 
            mastered business fundamentals through our 
            <span className="text-accent-secondary font-bold"> revolutionary visual learning system</span>
          </p>

          {/* Benefit Pills */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-16">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 bg-card/30 backdrop-blur-md rounded-2xl px-6 py-4 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:scale-105 group cursor-pointer animate-scale-in"
                style={{ 
                  animationDelay: `${index * 0.1 + 0.5}s`,
                  transform: `perspective(500px) rotateX(${mousePosition.y * 0.5}deg)`
                }}
              >
                <benefit.icon className={`w-5 h-5 ${benefit.color} flex-shrink-0 group-hover:scale-110 transition-transform`} />
                <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
                  {benefit.text.split(' - ')[0]}
                </span>
              </div>
            ))}
          </div>
          
          {/* CTA Buttons with Psychological Triggers */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-20">
            <Button 
              onClick={handleGetStarted}
              className="relative group btn-hero text-xl px-16 py-8 h-auto font-black shadow-2xl hover:shadow-xl overflow-hidden animate-scale-in"
              style={{ animationDelay: '0.8s' }}
            >
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent-secondary to-accent-tertiary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Shimmer Effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                  background: `linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)`,
                  animation: 'shimmer 1.5s infinite'
                }}
              />
              
              <span className="relative z-10 flex items-center gap-4">
                <Rocket className="w-6 h-6 group-hover:animate-bounce" />
                Start Your Journey FREE
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="text-xl px-12 py-8 h-auto font-bold border-2 border-primary/20 hover:border-primary/40 rounded-2xl backdrop-blur-md bg-card/20 hover:bg-card/40 group animate-scale-in"
              style={{ animationDelay: '1s' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Play className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold">Watch Success Stories</div>
                  <div className="text-sm text-muted-foreground">2 min preview</div>
                </div>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Button>
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center p-8 rounded-3xl bg-card/20 backdrop-blur-md border border-border/30 hover:border-primary/30 transition-all duration-500 hover:scale-105 group cursor-pointer animate-scale-in"
                style={{ 
                  animationDelay: `${index * 0.1 + 1.2}s`,
                  transform: `perspective(500px) rotateX(${mousePosition.y * 0.3}deg) rotateY(${mousePosition.x * 0.3}deg)`
                }}
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-4xl font-black text-gradient mb-2 group-hover:scale-110 transition-transform">
                  {stat.number}
                </div>
                <div className="text-lg font-bold text-foreground mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Features Section */}
      <section className="content-section bg-gradient-to-b from-background via-muted/5 to-background relative">
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute w-96 h-96 bg-primary/5 rounded-full blur-3xl"
            style={{
              left: `${30 + mousePosition.x * 5}%`,
              top: `${20 + mousePosition.y * 5}%`,
            }}
          />
          <div 
            className="absolute w-64 h-64 bg-accent-secondary/5 rounded-full blur-3xl"
            style={{
              right: `${20 - mousePosition.x * 3}%`,
              bottom: `${30 - mousePosition.y * 3}%`,
            }}
          />
        </div>
        
        <div className="content-container relative z-10">
          <div className="section-header">
            <h2 className="section-title animate-slide-up">
              Why <span className="text-gradient">10,000+ Professionals</span> Choose Us
            </h2>
            <p className="section-subtitle animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Experience the future of business education with our revolutionary visual learning platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <InteractiveCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
                delay={index * 0.2}
              />
            ))}
          </div>
        </div>
      </section>

      {/* AI Visual Generation Section */}
      <section className="content-section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5" />
        <div className="content-container relative">
          <div className="section-header">
            <h2 className="section-title animate-slide-up">
              Visualize Your <span className="text-gradient">Success</span>
            </h2>
            <p className="section-subtitle animate-fade-in" style={{ animationDelay: '0.2s' }}>
              AI-powered visual learning that transforms complex concepts into memorable experiences
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            {/* AI Visual Generator */}
            <div className="relative">
              <AIVisualGenerator />
            </div>

            {/* Benefits */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold">
                  Why Visual Learning Works Better
                </h3>
                <p className="text-xl text-muted-foreground">
                  Science-backed learning methods that increase retention by 400%
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { stat: "65%", text: "of people are visual learners", icon: Eye },
                  { stat: "90%", text: "of information processed by brain is visual", icon: Brain },
                  { stat: "30s", text: "to process visual vs 6 minutes for text", icon: Clock },
                  { stat: "400%", text: "better retention with visual learning", icon: TrendingUp }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-6 p-6 rounded-xl bg-card/30 backdrop-blur-md border border-border/20 hover:border-primary/30 transition-all duration-300 group animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent-secondary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary">{item.stat}</div>
                      <div className="text-muted-foreground">{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Psychological Urgency Section */}
      <section className="content-section bg-gradient-to-br from-red-500/5 via-background to-orange-500/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0%,transparent_50%)] opacity-10" />
        <div className="content-container relative">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-6">
              <div className="inline-flex items-center bg-red-500/10 text-red-600 px-6 py-3 rounded-full border border-red-500/20">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-bold">Limited Time Opportunity</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-display font-bold leading-tight">
                Your Competition is
                <br />
                <span className="text-gradient">Learning Right Now</span>
              </h2>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                While you're thinking about it, thousands of professionals are already advancing their careers. 
                Don't let this moment pass—your future self will thank you.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { 
                  number: "2,847", 
                  text: "Students enrolled this week", 
                  subtext: "Join them before spots fill up",
                  color: "text-green-500"
                },
                { 
                  number: "94%", 
                  text: "Got promoted within 6 months", 
                  subtext: "Real results, real careers",
                  color: "text-blue-500"
                },
                { 
                  number: "48hrs", 
                  text: "Left to claim your FREE access", 
                  subtext: "After that, it's $97/month",
                  color: "text-red-500"
                }
              ].map((stat, index) => (
                <Card key={index} className="text-center p-6 border-border/30 hover:border-primary/30 transition-all duration-300 hover:scale-105 animate-scale-in" style={{ animationDelay: `${index * 0.2}s` }}>
                  <CardContent className="p-0">
                    <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.number}</div>
                    <div className="font-semibold mb-2">{stat.text}</div>
                    <div className="text-sm text-muted-foreground">{stat.subtext}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-6">
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-xl px-12 py-6 rounded-2xl shadow-2xl hover:shadow-red-500/25 transition-all duration-300 group animate-pulse"
              >
                <span className="flex items-center gap-3">
                  <Zap className="w-6 h-6 group-hover:animate-bounce" />
                  CLAIM YOUR FREE ACCESS NOW
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              
              <p className="text-sm text-muted-foreground">
                ⚡ Instant access • 🔒 No credit card required • ✅ Join 50,000+ learners
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section with Visual Elements */}
      <section className="content-section">
        <div className="content-container">
          <div className="section-header">
            <h2 className="section-title animate-slide-up">
              Trusted by <span className="text-gradient">Industry Leaders</span>
            </h2>
            <p className="section-subtitle animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Join professionals from Fortune 500 companies who've transformed their careers
            </p>
          </div>

          {/* Enhanced Company Logos with Images */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 max-w-6xl mx-auto mb-16">
            {[
              { name: "Google", color: "from-blue-500 to-green-500" },
              { name: "Microsoft", color: "from-blue-600 to-cyan-500" },
              { name: "Apple", color: "from-gray-600 to-gray-800" },
              { name: "Amazon", color: "from-orange-500 to-yellow-500" },
              { name: "Meta", color: "from-blue-500 to-purple-600" },
              { name: "Netflix", color: "from-red-500 to-red-700" }
            ].map((company, index) => (
              <div key={index} className="group relative">
                <div className={`flex items-center justify-center p-6 rounded-xl bg-gradient-to-br ${company.color} opacity-60 hover:opacity-80 transition-all duration-300 animate-fade-in group-hover:scale-105`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="absolute inset-0 bg-white/10 rounded-xl" />
                  <span className="text-lg font-bold text-white relative z-10">{company.name}</span>
                </div>
                
                {/* Floating business icons */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Briefcase className="w-3 h-3 text-primary" />
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Success Metrics with Visual Context */}
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { 
                number: "50K+", 
                label: "Active Learners", 
                icon: Users, 
                bgImage: "from-blue-500/20 to-cyan-500/20",
                description: "Professionals worldwide"
              },
              { 
                number: "94%", 
                label: "Success Rate", 
                icon: CheckCircle, 
                bgImage: "from-green-500/20 to-emerald-500/20",
                description: "Career advancement"
              },
              { 
                number: "$25K", 
                label: "Avg Salary Increase", 
                icon: TrendingUp, 
                bgImage: "from-yellow-500/20 to-orange-500/20",
                description: "Within 6 months"
              },
              { 
                number: "4.9/5", 
                label: "Student Rating", 
                icon: Star, 
                bgImage: "from-purple-500/20 to-pink-500/20",
                description: "Verified reviews"
              }
            ].map((metric, index) => (
              <div key={index} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.bgImage} rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300`} />
                <div className="relative text-center space-y-4 p-6 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent-secondary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <metric.icon className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-primary mb-1">{metric.number}</div>
                    <div className="text-foreground font-medium mb-1">{metric.label}</div>
                    <div className="text-sm text-muted-foreground">{metric.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3D Showcase Section */}
      <section className="content-section relative">
        <div className="content-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Interactive Visual */}
            <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-accent-secondary/5 to-accent-tertiary/10 backdrop-blur-md border border-border/30 flex items-center justify-center">
              <div className="text-center space-y-4 animate-pulse">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary to-accent-secondary opacity-50" />
                <p className="text-lg font-bold text-primary">Visual Learning Hub</p>
                <p className="text-sm text-muted-foreground">Coming Soon</p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-6">
                <div className="inline-flex items-center bg-primary/10 rounded-full px-6 py-2">
                  <Lightbulb className="w-4 h-4 text-primary mr-2" />
                  <span className="text-sm font-bold text-primary">Innovation in Learning</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                  Learning That
                  <br />
                  <span className="text-gradient">Adapts to You</span>
                </h2>
                
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Our AI-powered platform creates personalized learning paths that evolve with your progress, 
                  ensuring maximum retention and real-world application.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Brain, text: "AI-Powered Personalization" },
                  { icon: Target, text: "Adaptive Learning Paths" },
                  { icon: BarChart3, text: "Real-Time Progress Analytics" },
                  { icon: Medal, text: "Industry-Recognized Certifications" }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card/30 backdrop-blur-md border border-border/20 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] group"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-lg font-semibold">{item.text}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={handleGetStarted}
                className="btn-hero text-lg px-10 py-6 group"
              >
                <span className="flex items-center gap-3">
                  <Gift className="w-5 h-5 group-hover:animate-bounce" />
                  Experience It FREE
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section className="content-section bg-gradient-to-b from-background via-muted/5 to-background">
        <div className="content-container">
          <div className="section-header">
            <h2 className="section-title animate-slide-up">
              Real <span className="text-gradient">Success Stories</span>
            </h2>
            <p className="section-subtitle animate-fade-in" style={{ animationDelay: '0.2s' }}>
              See how professionals like you transformed their careers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className="relative overflow-hidden group hover:scale-105 transition-all duration-500 animate-scale-in border-border/30 hover:border-primary/30"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardContent className="relative z-10 p-8">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-accent-tertiary fill-current" />
                    ))}
                  </div>
                  
                  {/* Content */}
                  <p className="text-muted-foreground leading-relaxed mb-8 italic text-lg">
                    "{testimonial.content}"
                  </p>
                  
                  {/* Growth Badge */}
                  <div className="bg-primary/10 rounded-full px-4 py-2 mb-6 inline-block">
                    <span className="text-sm font-bold text-primary">
                      ✨ {testimonial.growth}
                    </span>
                  </div>
                  
                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent-secondary flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-primary font-medium">{testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="content-section relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent-secondary/5 to-accent-tertiary/10" />
          <div 
            className="absolute w-full h-full opacity-30"
            style={{
              background: `radial-gradient(circle at ${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%, hsl(var(--primary) / 0.2) 0%, transparent 70%)`
            }}
          />
        </div>
        
        <div className="content-container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-gradient-to-r from-primary/20 to-accent-secondary/20 backdrop-blur-xl rounded-full px-8 py-4 mb-8 border border-primary/30 shadow-xl">
              <Crown className="w-5 h-5 text-primary mr-3" />
              <span className="text-sm font-bold text-gradient">Limited Time Offer</span>
            </div>
            
            <h2 
              className="text-5xl md:text-6xl font-display font-black mb-8 animate-slide-up"
              style={{
                background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent-secondary)))`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Ready to Transform
              <br />
              Your Career?
            </h2>
            
            <p className="text-2xl text-muted-foreground mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Join <span className="text-primary font-bold">10,000+ successful professionals</span> who 
              accelerated their careers with our proven system.
              <br />
              <span className="text-accent-secondary font-bold">Start your journey today - completely FREE!</span>
            </p>

            <div className="flex flex-col items-center gap-8 mb-12">
              <Button 
                onClick={handleGetStarted}
                className="btn-hero text-2xl px-20 py-10 h-auto font-black shadow-2xl group animate-scale-in"
                style={{ animationDelay: '0.5s' }}
              >
                <span className="flex items-center gap-4">
                  <Rocket className="w-8 h-8 group-hover:animate-bounce" />
                  Start Learning FREE Today
                  <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                </span>
              </Button>
              
              <div className="flex items-center gap-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.7s' }}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>No Credit Card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Instant Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Cancel Anytime</span>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-scale-in" style={{ animationDelay: '0.9s' }}>
              {[
                { icon: Shield, text: "100% Secure" },
                { icon: Users, text: "10K+ Students" },
                { icon: Medal, text: "Industry Certified" },
                { icon: Heart, text: "Loved by Pros" }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/20 backdrop-blur-md border border-border/20">
                  <item.icon className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Home;