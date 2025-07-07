import SectionLayout from '@/components/SectionLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Code, BarChart3, TrendingUp, CheckCircle, ArrowRight, Zap, Target, Users, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PythonToolsPage = () => {
  const navigate = useNavigate();

  const handleJoinNow = () => {
    navigate('/dashboard');
  };

  const tools = [
    {
      name: "Statistical Analysis Engine",
      description: "Perform complex statistical calculations and data analysis",
      features: ["Descriptive Statistics", "Hypothesis Testing", "Regression Analysis", "Data Visualization"],
      icon: BarChart3,
      color: "from-blue-500/20 to-cyan-500/10"
    },
    {
      name: "Financial Calculator", 
      description: "Advanced financial modeling and calculation tools",
      features: ["NPV & IRR Calculations", "Portfolio Analysis", "Risk Assessment", "Compound Interest"],
      icon: Calculator,
      color: "from-green-500/20 to-emerald-500/10"
    },
    {
      name: "Data Processing Hub",
      description: "Clean, transform, and manipulate datasets efficiently",
      features: ["Data Cleaning", "CSV Processing", "Data Transformation", "Export Functions"],
      icon: Code,
      color: "from-purple-500/20 to-violet-500/10"
    },
    {
      name: "Predictive Analytics",
      description: "Machine learning models for forecasting and predictions",
      features: ["Trend Analysis", "Forecasting Models", "Pattern Recognition", "Predictive Insights"],
      icon: TrendingUp,
      color: "from-orange-500/20 to-red-500/10"
    }
  ];

  const benefits = [
    "No Python installation required - runs in your browser",
    "Access to 100+ pre-built calculation templates",
    "Real-time collaboration and sharing capabilities",
    "Export results to Excel, CSV, and PDF formats",
    "Advanced visualization and charting tools",
    "Cloud storage for all your calculations and datasets",
    "24/7 support and comprehensive documentation",
    "Regular updates with new tools and features"
  ];

  const usesCases = [
    {
      title: "Financial Analysis",
      description: "Investment calculations, portfolio optimization, and risk analysis",
      icon: Calculator,
      examples: ["ROI Calculations", "Portfolio Diversification", "Risk Metrics", "Financial Modeling"]
    },
    {
      title: "Business Intelligence",
      description: "Data analysis, reporting, and business metrics tracking", 
      icon: BarChart3,
      examples: ["Sales Analytics", "Customer Segmentation", "Performance KPIs", "Market Research"]
    },
    {
      title: "Research & Academia",
      description: "Statistical analysis, hypothesis testing, and research validation",
      icon: Target,
      examples: ["Statistical Tests", "Survey Analysis", "Research Validation", "Data Visualization"]
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Data Scientist at FinTech Corp",
      content: "This platform has revolutionized how I handle complex calculations. The Python-like environment is incredibly powerful!",
      avatar: "SJ",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Financial Analyst", 
      content: "I can now perform advanced financial modeling without setting up complex environments. Saves me hours every week!",
      avatar: "MC",
      rating: 5
    },
    {
      name: "Prof. Emily Rodriguez",
      role: "Statistics Professor",
      content: "Perfect for teaching statistical concepts. My students love the interactive calculations and visualizations.",
      avatar: "ER", 
      rating: 5
    }
  ];

  const stats = [
    { number: "50,000+", label: "Calculations Run", icon: Calculator },
    { number: "1,200+", label: "Active Users", icon: Users },
    { number: "99.9%", label: "Uptime", icon: Target },
    { number: "4.9", label: "User Rating", icon: Star }
  ];

  return (
    <SectionLayout 
      sectionName="Python Computing Platform" 
      sectionIcon={Calculator}
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
              <Code className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-semibold text-gradient">🚀 Most Advanced Computing Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-8 leading-[1.1] tracking-tight animate-slide-up">
              Python-Powered
              <br />
              <span className="text-gradient">Computation Engine</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium max-w-4xl mx-auto mb-12 animate-fade-in">
              Perform complex calculations, statistical analysis, and data processing with
              <span className="text-primary font-bold"> zero setup required.</span> Start computing instantly!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up">
              <Button 
                onClick={handleJoinNow}
                className="btn-hero text-lg px-8 py-6 font-bold shadow-2xl group"
              >
                <span className="flex items-center gap-2">
                  Start Computing FREE
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <Button 
                variant="outline" 
                className="text-lg px-8 py-6 font-semibold border-2 hover-glow"
              >
                <Code className="w-5 h-5 mr-2" />
                View Live Demo
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

      {/* Tools Section */}
      <section className="content-section bg-gradient-to-b from-background via-muted/5 to-background">
        <div className="content-container">
          <div className="section-header mb-16 text-center">
            <h2 className="section-title animate-slide-up">
              Powerful <span className="text-gradient">Computing Tools</span>
            </h2>
            <p className="section-subtitle animate-fade-in">
              Everything you need for advanced calculations and data analysis, all in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
            {tools.map((tool, index) => (
              <Card 
                key={index} 
                className="card-elevated hover-lift animate-scale-in relative overflow-hidden"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-50 -z-10`}></div>
                
                <CardHeader className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent-secondary/10 flex items-center justify-center">
                      <tool.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-display font-bold text-gradient-secondary">
                      {tool.name}
                    </CardTitle>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {tool.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {tool.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="content-section">
        <div className="content-container">
          <div className="section-header mb-16 text-center">
            <h2 className="section-title animate-slide-up">
              Perfect For <span className="text-gradient">Every Use Case</span>
            </h2>
            <p className="section-subtitle animate-fade-in">
              From financial analysis to academic research, our platform handles it all
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
            {usesCases.map((useCase, index) => (
              <Card 
                key={index} 
                className="card-elevated hover-lift text-center animate-scale-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent-secondary/10 flex items-center justify-center">
                    <useCase.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gradient-secondary">{useCase.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{useCase.description}</p>
                  <div className="space-y-2">
                    {useCase.examples.map((example, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs mx-1">
                        {example}
                      </Badge>
                    ))}
                  </div>
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
                Why Choose Our
                <br />
                <span className="text-gradient">Computing Platform?</span>
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
                  Start Computing Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>

            <div className="space-y-6 animate-slide-up">
              {/* Demo Code Block */}
              <Card className="card-elevated">
                <CardHeader className="p-4 bg-slate-900 text-green-400 font-mono text-sm rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="ml-4">Python Computing Engine</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 bg-slate-900 text-green-400 font-mono text-sm rounded-b-lg">
                  <div className="space-y-2">
                    <div>{'> import numpy as np'}</div>
                    <div>{'> data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]'}</div>
                    <div>{'> result = np.mean(data)'}</div>
                    <div className="text-blue-400">{'Output: 5.5'}</div>
                    <div>{'> np.std(data)'}</div>
                    <div className="text-blue-400">{'Output: 2.87'}</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                    <h3 className="font-bold text-lg">Instant Results</h3>
                  </div>
                  <p className="text-muted-foreground">
                    No waiting, no setup time. Your calculations run instantly in our optimized cloud environment.
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
              Trusted by <span className="text-gradient">Professionals</span>
            </h2>
            <p className="section-subtitle animate-fade-in">
              See what data scientists, analysts, and researchers are saying about our platform
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
              Ready to Start
              <br />
              <span className="text-gradient">Computing?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
              Join 1,200+ professionals already using our platform for advanced calculations and data analysis. 
              No installation required - start computing instantly!
            </p>
            <Button 
              onClick={handleJoinNow}
              className="btn-hero text-xl px-12 py-8 font-bold shadow-2xl group animate-scale-in"
            >
              <span className="flex items-center gap-3">
                Start Computing FREE
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              ✓ No Credit Card Required ✓ Instant Access ✓ Full Features Included
            </p>
          </div>
        </div>
      </section>
    </SectionLayout>
  );
};

export default PythonToolsPage;