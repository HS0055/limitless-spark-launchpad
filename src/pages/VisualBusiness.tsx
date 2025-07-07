import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Users, Target, TrendingUp, Lightbulb, Eye, Heart, Share2, BookOpen, Zap, Focus, Scale } from "lucide-react";

const VisualBusiness = () => {
  const mindsetCategories = [
    { name: "Mental Models", count: 48, icon: Brain, color: "text-primary", description: "Frameworks for better thinking" },
    { name: "Decision Making", count: 32, icon: Target, color: "text-accent-secondary", description: "Tools for smarter choices" },
    { name: "Leadership", count: 24, icon: Users, color: "text-accent-tertiary", description: "Models for effective leadership" },
    { name: "Strategic Thinking", count: 38, icon: Lightbulb, color: "text-primary", description: "Long-term planning frameworks" }
  ];

  const mentalModels = [
    {
      id: 1,
      title: "Inversion Thinking",
      category: "Problem Solving",
      description: "Approach problems by considering what you want to avoid rather than what you want to achieve",
      difficulty: "Beginner",
      applications: ["Decision Making", "Risk Assessment", "Planning"],
      views: "8.2K",
      likes: 445,
      icon: "🔄"
    },
    {
      id: 2,
      title: "First Principles Thinking",
      category: "Innovation",
      description: "Break down complex problems into fundamental truths and build up from there",
      difficulty: "Advanced",
      applications: ["Innovation", "Problem Solving", "Strategy"],
      views: "12.8K",
      likes: 892,
      icon: "🏗️"
    },
    {
      id: 3,
      title: "Circle of Competence",
      category: "Self-Awareness",
      description: "Focus on areas where you have deep knowledge and avoid areas where you don't",
      difficulty: "Intermediate",
      applications: ["Investment", "Career", "Decision Making"],
      views: "6.4K",
      likes: 324,
      icon: "🎯"
    },
    {
      id: 4,
      title: "Systems Thinking",
      category: "Analysis",
      description: "Understand how parts interconnect and influence the whole system",
      difficulty: "Advanced",
      applications: ["Business Strategy", "Problem Solving", "Leadership"],
      views: "15.2K",
      likes: 967,
      icon: "🔗"
    },
    {
      id: 5,
      title: "Pareto Principle (80/20)",
      category: "Productivity",
      description: "80% of effects come from 20% of causes - focus on what matters most",
      difficulty: "Beginner",
      applications: ["Time Management", "Business", "Productivity"],
      views: "18.6K",
      likes: 1234,
      icon: "📊"
    },
    {
      id: 6,
      title: "Opportunity Cost",
      category: "Economics",
      description: "The value of the best alternative foregone when making a choice",
      difficulty: "Intermediate",
      applications: ["Finance", "Business", "Personal Decisions"],
      views: "9.8K",
      likes: 556,
      icon: "⚖️"
    },
    {
      id: 7,
      title: "Confirmation Bias",
      category: "Psychology",
      description: "The tendency to search for information that confirms our preexisting beliefs",
      difficulty: "Beginner",
      applications: ["Decision Making", "Research", "Critical Thinking"],
      views: "11.2K",
      likes: 678,
      icon: "🔍"
    },
    {
      id: 8,
      title: "Compound Interest",
      category: "Finance",
      description: "Small, consistent actions compound over time to create extraordinary results",
      difficulty: "Beginner",
      applications: ["Investment", "Personal Growth", "Business"],
      views: "22.4K",
      likes: 1567,
      icon: "📈"
    }
  ];

  const insights = [
    { name: "Cognitive Biases", models: 24, trend: "+15%", description: "Understanding mental shortcuts and errors" },
    { name: "Decision Frameworks", models: 18, trend: "+22%", description: "Structured approaches to choices" },
    { name: "Strategic Models", models: 32, trend: "+8%", description: "Business and competitive strategy" },
    { name: "Behavioral Economics", models: 15, trend: "+18%", description: "Psychology meets economics" },
    { name: "Systems Design", models: 21, trend: "+12%", description: "Building effective systems" }
  ];

  const stats = [
    { number: "142", label: "Mental Models", icon: Brain, color: "text-primary" },
    { number: "45.8K", label: "Learning Sessions", icon: BookOpen, color: "text-accent-secondary" },
    { number: "3.2K", label: "Active Thinkers", icon: Users, color: "text-accent-tertiary" },
    { number: "92%", label: "Better Decisions", icon: Target, color: "text-primary" }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="content-section pt-24 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-accent-tertiary/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>
        
        <div className="content-container">
          <div className="section-header">
            <div className="inline-flex items-center bg-gradient-to-r from-accent-tertiary/10 to-primary/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-accent-tertiary/20 shadow-lg animate-scale-in">
              <Brain className="w-4 h-4 text-accent-tertiary mr-2" />
              <span className="text-sm font-semibold text-gradient">🧠 Mindset League</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-8 leading-[1.1] tracking-tight animate-slide-up">
              Build A Unique
              <br />
              <span className="text-gradient">Mind</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium max-w-4xl mx-auto mb-12 animate-fade-in">
              Unlock a wealth of curated mental models, ideas, and resources to excel in today's complex world.
              <span className="text-accent-tertiary font-bold"> Think better, decide smarter</span>, and upgrade your cognitive toolkit.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-20">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center p-6 rounded-2xl card-glass hover-lift hover-glow group animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-accent-tertiary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
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

      {/* Insights Categories */}
      <section className="content-section bg-gradient-to-b from-background via-muted/5 to-background">
        <div className="content-container">
          <div className="section-header mb-16">
            <h2 className="section-title animate-slide-up">
              <span className="text-gradient">Insights</span>
            </h2>
            <p className="section-subtitle animate-fade-in">
              Frameworks and ideas that will upgrade your abilities as a thinker and decision-maker
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
            {mindsetCategories.map((category, index) => (
              <Card 
                key={category.name} 
                className="card-elevated hover-lift group animate-scale-in cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-muted to-muted-dark flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <category.icon className={`w-8 h-8 ${category.color}`} />
                  </div>
                  <h3 className="text-lg font-display font-bold mb-2 text-gradient-secondary">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                  <p className="text-2xl font-bold text-primary mb-1">{category.count}</p>
                  <p className="text-sm text-muted-foreground">Models</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mental Models Grid */}
      <section className="content-section">
        <div className="content-container">
          <div className="section-header mb-16">
            <h2 className="section-title animate-slide-up">
              Management & <span className="text-gradient">Leadership</span>
            </h2>
            <p className="section-subtitle animate-fade-in">
              Models that will help you make better business decisions and lead others more effectively
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
            {mentalModels.map((model, index) => (
              <Card 
                key={model.id} 
                className="card-elevated hover-lift group animate-scale-in bg-gradient-to-br from-muted/50 to-muted-dark/50 border-border/50"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">{model.icon}</div>
                    <Badge 
                      variant={model.difficulty === 'Beginner' ? 'default' : model.difficulty === 'Intermediate' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {model.difficulty}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-display font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                    {model.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4 flex-grow leading-relaxed">
                    {model.description}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Applications</p>
                      <div className="flex flex-wrap gap-1">
                        {model.applications.slice(0, 2).map((app, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5">
                            {app}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{model.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{model.likes}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs hover-glow">
                        Learn
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Pathways */}
      <section className="content-section bg-gradient-to-b from-muted/5 to-background">
        <div className="content-container">
          <div className="grid lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              <h3 className="text-3xl font-display font-bold mb-8 text-gradient-secondary">Start Your Journey</h3>
              <div className="space-y-6">
                <Card className="card-glass">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent-secondary/10 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="text-xl font-semibold">Mental Model Mastery</h4>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Build your cognitive toolkit with curated mental models. Learn to think in systems, 
                      avoid cognitive biases, and make better decisions across all areas of life.
                    </p>
                    <div className="flex gap-4">
                      <Button className="btn-hero">
                        <span className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Start Learning
                        </span>
                      </Button>
                      <Button variant="outline">View Curriculum</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-glass">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-tertiary/20 to-primary/10 rounded-xl flex items-center justify-center">
                        <Focus className="w-6 h-6 text-accent-tertiary" />
                      </div>
                      <h4 className="text-xl font-semibold">Decision Framework Builder</h4>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Create your personal decision-making framework using proven models. 
                      Reduce decision fatigue and improve the quality of your choices.
                    </p>
                    <Button variant="outline" className="btn-outline-enhanced">
                      <span className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Build Framework
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-display font-bold mb-8 text-gradient-secondary">Popular Areas</h3>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <Card key={index} className="card-glass hover-lift">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{insight.name}</h4>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-accent-tertiary" />
                          <span className="text-sm font-semibold text-accent-tertiary">{insight.trend}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      <p className="text-xs text-muted-foreground">{insight.models} models available</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button className="w-full mt-6 btn-hero">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Explore All Areas
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VisualBusiness;