import SectionLayout from "@/components/SectionLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Users, BookOpen, Star, CheckCircle, ArrowRight, Target, Zap, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const League = () => {
  const navigate = useNavigate();

  const handleJoinNow = () => {
    navigate('/dashboard');
  };

  const programs = [
    {
      id: 1,
      title: "Business Fundamentals",
      description: "Master core business principles through visual learning in just 8 weeks",
      level: "Beginner",
      duration: "8 weeks",
      students: "650+",
      rating: 4.97,
      price: "FREE",
      originalPrice: "$199",
      lessons: 24,
      badge: "Most Popular",
      color: "from-primary/20 to-accent-secondary/10"
    },
    {
      id: 2,
      title: "Digital Marketing Mastery", 
      description: "Advanced marketing strategies and real-world campaign building",
      level: "Intermediate",
      duration: "10 weeks",
      students: "420+",
      rating: 4.92,
      price: "FREE",
      originalPrice: "$299",
      lessons: 32,
      badge: "High Demand",
      color: "from-accent-secondary/20 to-accent-tertiary/10"
    },
    {
      id: 3,
      title: "Financial Planning Pro",
      description: "Wealth management and investment strategies with expert coaching",
      level: "Advanced", 
      duration: "12 weeks",
      students: "280+",
      rating: 4.95,
      price: "FREE",
      originalPrice: "$399",
      lessons: 36,
      badge: "Premium",
      color: "from-accent-tertiary/20 to-primary/10"
    }
  ];

  const features = [
    {
      icon: BookOpen,
      title: "Visual Learning Method",
      description: "Learn complex concepts through engaging visual content and interactive examples"
    },
    {
      icon: Users,
      title: "Expert Community",
      description: "Connect with industry professionals and fellow learners in our exclusive community"
    },
    {
      icon: Trophy,
      title: "Certificates & Recognition",
      description: "Earn valuable certificates and showcase your achievements to employers"
    },
    {
      icon: Zap,
      title: "Practical Projects", 
      description: "Apply your knowledge with real-world projects and build a strong portfolio"
    }
  ];

  const benefits = [
    "Access to all premium courses and programs",
    "Live weekly Q&A sessions with industry experts",
    "Exclusive community of 2,000+ business professionals",
    "Certificate of completion for each program",
    "Lifetime access to course materials and updates",
    "1-on-1 mentorship opportunities with successful entrepreneurs",
    "Job placement assistance and career guidance",
    "Money-back guarantee within first 30 days"
  ];

  const testimonials = [
    {
      name: "Emily Rodriguez",
      role: "Marketing Manager at TechCorp",
      content: "The visual learning approach made complex business concepts so easy to understand. I got promoted within 3 months!",
      avatar: "ER",
      rating: 5,
      company: "TechCorp"
    },
    {
      name: "Marcus Johnson",
      role: "Startup Founder",
      content: "These programs gave me the foundation I needed to launch my startup. Now generating $50K/month!",
      avatar: "MJ", 
      rating: 5,
      company: "InnovateLab"
    },
    {
      name: "Sarah Chen",
      role: "Business Consultant",
      content: "The community and mentorship are invaluable. I've built lasting professional relationships here.",
      avatar: "SC",
      rating: 5,
      company: "Strategy Plus"
    }
  ];

  const stats = [
    { number: "2,000+", label: "Active Students", icon: Users },
    { number: "15+", label: "Expert Instructors", icon: Trophy },
    { number: "92%", label: "Success Rate", icon: Target },
    { number: "4.9", label: "Average Rating", icon: Star }
  ];

  return (
    <SectionLayout 
      sectionName="Business Learning Leagues" 
      sectionIcon={Trophy}
      sectionColor="from-primary to-accent-secondary"
    >
      
      {/* Hero Section */}
      <section className="content-section pt-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-secondary/20 rounded-full blur-3xl animate-float-delayed"></div>
        </div>
        
        <div className="content-container">
          <div className="section-header text-center">
            <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-accent-secondary/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-primary/20 shadow-lg animate-scale-in">
              <Target className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-semibold text-gradient">🏆 #1 Business Education Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-8 leading-[1.1] tracking-tight animate-slide-up">
              Master Business Skills
              <br />
              <span className="text-gradient">Through Visual Learning</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium max-w-4xl mx-auto mb-12 animate-fade-in">
              Join 2,000+ professionals who accelerated their careers with our 
              <span className="text-primary font-bold"> proven visual learning system.</span> Start free today!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up">
              <Button 
                onClick={handleJoinNow}
                className="btn-hero text-lg px-8 py-6 font-bold shadow-2xl group"
              >
                <span className="flex items-center gap-2">
                  Start Learning FREE Today
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <Button 
                variant="outline" 
                className="text-lg px-8 py-6 font-semibold border-2 hover-glow"
              >
                <Play className="w-5 h-5 mr-2" />
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
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-gradient mb-2">{stat.number}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="content-section bg-gradient-to-b from-background via-muted/5 to-background">
        <div className="content-container">
          <div className="section-header mb-16 text-center">
            <h2 className="section-title animate-slide-up">
              Choose Your <span className="text-gradient">Learning Path</span>
            </h2>
            <p className="section-subtitle animate-fade-in">
              All programs now available FREE for a limited time - Save up to $399 per course!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
            {programs.map((program, index) => (
              <Card 
                key={program.id} 
                className="card-elevated group hover-lift animate-scale-in relative overflow-hidden"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${program.color} opacity-50 -z-10`}></div>
                
                <CardHeader className="p-6 relative">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="secondary" className="font-semibold">
                      {program.level}
                    </Badge>
                    <Badge className="bg-red-500 text-white font-bold animate-pulse">
                      {program.badge}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-xl font-display font-bold mb-3 text-gradient-secondary">
                    {program.title}
                  </CardTitle>
                  
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {program.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{program.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{program.lessons} lessons</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-accent-tertiary fill-current" />
                        <span className="font-semibold">{program.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm">{program.students} students</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{program.price}</div>
                      <div className="text-sm text-muted-foreground line-through">{program.originalPrice}</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-0">
                  <Button 
                    onClick={handleJoinNow}
                    className="w-full btn-hero font-semibold group"
                  >
                    <span className="flex items-center gap-2">
                      Enroll Now - FREE
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="content-section">
        <div className="content-container">
          <div className="section-header mb-16 text-center">
            <h2 className="section-title animate-slide-up">
              Why Choose <span className="text-gradient">Our Platform?</span>
            </h2>
            <p className="section-subtitle animate-fade-in">
              Learn faster and retain more with our proven visual learning methodology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="card-elevated hover-lift text-center group animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="w-8 h-8 text-primary" />
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
      <section className="content-section bg-gradient-to-b from-background via-muted/5 to-background">
        <div className="content-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-up">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 leading-tight">
                What You Get
                <br />
                <span className="text-gradient">With Membership</span>
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-4 p-4 rounded-xl card-glass animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                    <span className="text-lg font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button 
                onClick={handleJoinNow}
                className="btn-hero text-lg px-8 py-6 font-bold mt-8 w-full sm:w-auto group"
              >
                <span className="flex items-center gap-2">
                  Join FREE Today
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>

            <div className="space-y-6 animate-slide-up">
              <Card className="card-elevated">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent-secondary flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Certificate Ready</h3>
                      <p className="text-sm text-muted-foreground">Industry-recognized certificates</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Earn valuable certificates that you can showcase on LinkedIn and to potential employers.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-secondary to-accent-tertiary flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Expert Community</h3>
                      <p className="text-sm text-muted-foreground">Connect with professionals</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Network with industry experts and like-minded professionals in our exclusive community.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="content-section">
        <div className="content-container">
          <div className="section-header mb-16 text-center">
            <h2 className="section-title animate-slide-up">
              Success <span className="text-gradient">Stories</span>
            </h2>
            <p className="section-subtitle animate-fade-in">
              See how our students have transformed their careers and businesses
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent-secondary flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
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
      <section className="content-section">
        <div className="content-container">
          <div className="text-center card-elevated p-16 rounded-3xl bg-gradient-to-br from-primary/5 to-accent-secondary/5 border border-primary/10">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 animate-slide-up">
              Ready to Transform
              <br />
              <span className="text-gradient">Your Career?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
              Join 2,000+ professionals who have accelerated their careers with our visual learning programs. 
              Start your journey today - completely free!
            </p>
            <Button 
              onClick={handleJoinNow}
              className="btn-hero text-xl px-12 py-8 font-bold shadow-2xl group animate-scale-in"
            >
              <span className="flex items-center gap-3">
                Join FREE - Start Learning Today
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              ✓ Instant Access ✓ All Courses Included ✓ Cancel Anytime
            </p>
          </div>
        </div>
      </section>
    </SectionLayout>
  );
};

export default League;