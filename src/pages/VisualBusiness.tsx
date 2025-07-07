import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Users, Target, TrendingUp, Lightbulb, Eye, Heart, Share2, BookOpen, Zap, Focus, Scale, Star, MessageCircle, ThumbsUp, Bookmark, Filter, Search, Grid3X3, List, ChevronDown, Lock, ArrowRight, CheckCircle, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { Link } from "react-router-dom";

const VisualBusiness = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [userFeedback, setUserFeedback] = useState<string>('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const mindsetCategories = [
    { name: "Mental Models", count: 48, icon: Brain, color: "text-primary", description: "Frameworks for better thinking" },
    { name: "Decision Making", count: 32, icon: Target, color: "text-accent-secondary", description: "Tools for smarter choices" },
    { name: "Leadership", count: 24, icon: Users, color: "text-accent-tertiary", description: "Models for effective leadership" },
    { name: "Strategic Thinking", count: 38, icon: Lightbulb, color: "text-primary", description: "Long-term planning frameworks" }
  ];

  // Show limited content for guests, full content for members
  const allMentalModels = [
    {
      id: 1,
      title: "Inversion Thinking",
      category: "Problem Solving",
      description: "Approach problems by considering what you want to avoid rather than what you want to achieve",
      difficulty: "Beginner",
      applications: ["Decision Making", "Risk Assessment", "Planning"],
      views: 8234,
      likes: 445,
      icon: "🔄",
      rating: 4.8,
      isLocked: false // Always free
    },
    {
      id: 2,
      title: "First Principles Thinking",
      category: "Innovation",
      description: "Break down complex problems into fundamental truths and build up from there",
      difficulty: "Advanced",
      applications: ["Innovation", "Problem Solving", "Strategy"],
      views: 12834,
      likes: 892,
      icon: "🏗️",
      rating: 4.9,
      isLocked: false // Always free
    },
    {
      id: 3,
      title: "Circle of Competence",
      category: "Self-Awareness",
      description: "Focus on areas where you have deep knowledge and avoid areas where you don't",
      difficulty: "Intermediate",
      applications: ["Investment", "Career", "Decision Making"],
      views: 6412,
      likes: 324,
      icon: "🎯",
      rating: 4.6,
      isLocked: !user // Locked for guests
    },
    {
      id: 4,
      title: "Systems Thinking",
      category: "Analysis",
      description: "Understand how parts interconnect and influence the whole system",
      difficulty: "Advanced",
      applications: ["Business Strategy", "Problem Solving", "Leadership"],
      views: 15234,
      likes: 967,
      icon: "🔗",
      rating: 4.7,
      isLocked: !user // Locked for guests
    },
    {
      id: 5,
      title: "Pareto Principle (80/20)",
      category: "Productivity",
      description: "80% of effects come from 20% of causes - focus on what matters most",
      difficulty: "Beginner",
      applications: ["Time Management", "Business", "Productivity"],
      views: 18634,
      likes: 1234,
      icon: "📊",
      rating: 4.9,
      isLocked: !user // Locked for guests
    },
    {
      id: 6,
      title: "Opportunity Cost",
      category: "Economics",
      description: "The value of the best alternative foregone when making a choice",
      difficulty: "Intermediate",
      applications: ["Finance", "Business", "Personal Decisions"],
      views: 9812,
      likes: 556,
      icon: "⚖️",
      rating: 4.5,
      isLocked: !user // Locked for guests
    },
    {
      id: 7,
      title: "Confirmation Bias",
      category: "Psychology",
      description: "The tendency to search for information that confirms our preexisting beliefs",
      difficulty: "Beginner",
      applications: ["Decision Making", "Research", "Critical Thinking"],
      views: 11234,
      likes: 678,
      icon: "🔍",
      rating: 4.8,
      isLocked: !user // Locked for guests
    },
    {
      id: 8,
      title: "Compound Interest",
      category: "Finance",
      description: "Small, consistent actions compound over time to create extraordinary results",
      difficulty: "Beginner",
      applications: ["Investment", "Personal Growth", "Business"],
      views: 22456,
      likes: 1567,
      icon: "📈",
      rating: 4.9,
      isLocked: !user // Locked for guests
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

  // Enhanced interaction handlers
  const handleLike = (modelId: number) => {
    toast({
      title: "Added to favorites!",
      description: "This mental model has been saved to your collection.",
    });
  };

  const handleToggleFavorite = (modelId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(modelId)) {
      newFavorites.delete(modelId);
      toast({
        title: "Removed from favorites",
        description: "Mental model removed from your collection.",
      });
    } else {
      newFavorites.add(modelId);
      toast({
        title: "Added to favorites!",
        description: "Mental model saved to your collection.",
      });
    }
    setFavorites(newFavorites);
  };

  const handleShare = (model: any) => {
    if (navigator.share) {
      navigator.share({
        title: model.title,
        text: model.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard.",
      });
    }
  };

  const submitFeedback = () => {
    if (userFeedback.trim()) {
      toast({
        title: "Feedback submitted!",
        description: "Thank you for helping us improve the experience.",
      });
      setUserFeedback('');
      setShowFeedbackForm(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Filter mental models based on category and search
  const filteredModels = allMentalModels.filter(model => {
    const matchesCategory = selectedCategory === 'all' || model.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = searchQuery === '' || 
      model.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.applications.some(app => app.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium max-w-4xl mx-auto mb-8 animate-fade-in">
              Unlock a wealth of curated mental models, ideas, and resources to excel in today's complex world.
              <span className="text-accent-tertiary font-bold"> Think better, decide smarter</span>, and upgrade your cognitive toolkit.
            </p>

            {/* Member vs Guest messaging */}
            {!user && (
              <div className="bg-gradient-to-r from-primary/10 to-accent-secondary/10 backdrop-blur-sm rounded-2xl p-6 border border-primary/20 shadow-lg mb-12 animate-scale-in">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Crown className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold text-gradient">Preview Mode</h3>
                </div>
                <p className="text-center text-muted-foreground mb-4">
                  You're viewing a limited preview. Join TopOne Academy to unlock all 142 mental models and advanced features.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/dashboard">
                    <Button className="btn-hero">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Join Academy - Unlock All
                      </span>
                    </Button>
                  </Link>
                  <Button variant="outline" className="btn-outline-enhanced">
                    <span className="flex items-center gap-2">
                      See What's Included
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Button>
                </div>
              </div>
            )}

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

          {/* Enhanced Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12 bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search mental models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background/80 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-background/80 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Categories</option>
                  <option value="problem solving">Problem Solving</option>
                  <option value="innovation">Innovation</option>
                  <option value="self-awareness">Self-Awareness</option>
                  <option value="analysis">Analysis</option>
                  <option value="productivity">Productivity</option>
                  <option value="economics">Economics</option>
                  <option value="psychology">Psychology</option>
                  <option value="finance">Finance</option>
                </select>
              </div>
              
              <div className="flex items-center gap-1 bg-background/60 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results count with membership info */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredModels.length} of {allMentalModels.length} mental models
              {searchQuery && (
                <span className="ml-2 text-primary font-medium">
                  for "{searchQuery}"
                </span>
              )}
            </p>
            {!user && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>{allMentalModels.filter(m => m.isLocked).length} models locked</span>
              </div>
            )}
          </div>

          {/* Enhanced Mental Models Grid/List */}
          <div className={`${viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          } max-w-7xl mx-auto mb-16`}>
            {filteredModels.map((model, index) => (
              <Card 
                key={model.id} 
                className={`card-elevated hover-lift group animate-scale-in bg-gradient-to-br from-muted/50 to-muted-dark/50 border-border/50 ${
                  viewMode === 'list' ? 'flex flex-row items-center p-6' : ''
                } ${model.isLocked ? 'relative overflow-hidden' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Lock overlay for non-members */}
                {model.isLocked && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="text-center p-6">
                      <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-semibold mb-2">Premium Content</p>
                      <p className="text-xs text-muted-foreground mb-4">Join to unlock this mental model</p>
                      <Link to="/dashboard">
                        <Button size="sm" className="btn-hero">
                          Join Academy
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                <CardContent className={`${viewMode === 'grid' ? 'p-6 h-full flex flex-col' : 'flex-1 p-0'} ${model.isLocked ? 'opacity-50' : ''}`}>
                  <div className={`flex items-center justify-between mb-4 ${viewMode === 'list' ? 'mb-0' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{model.icon}</div>
                      {viewMode === 'list' && (
                        <div className="flex-1">
                          <h3 className="text-lg font-display font-bold text-foreground group-hover:text-primary transition-colors">
                            {model.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{model.category}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={model.difficulty === 'Beginner' ? 'default' : model.difficulty === 'Intermediate' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {model.difficulty}
                      </Badge>
                      {viewMode === 'list' && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 fill-current text-yellow-500" />
                          <span>{model.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {viewMode === 'grid' && (
                    <>
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
                              <span>{formatNumber(model.views)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              <span>{model.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current text-yellow-500" />
                              <span>{model.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Action buttons */}
                  <div className={`flex gap-2 ${viewMode === 'list' ? 'ml-auto' : 'mt-4'}`}>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="hover-glow group"
                      onClick={() => handleToggleFavorite(model.id)}
                      disabled={model.isLocked}
                    >
                      <Bookmark className={`w-4 h-4 ${favorites.has(model.id) ? 'fill-current text-primary' : ''}`} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="hover-glow"
                      onClick={() => handleShare(model)}
                      disabled={model.isLocked}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      className="hover-glow"
                      disabled={model.isLocked}
                    >
                      {model.isLocked ? <Lock className="w-4 h-4" /> : 'Learn'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No results message */}
          {filteredModels.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No mental models found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
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

      {/* Enhanced User Feedback Section */}
      <section className="content-section bg-gradient-to-b from-background via-muted/5 to-background">
        <div className="content-container">
          <div className="max-w-4xl mx-auto">
            <div className="section-header mb-12">
              <h2 className="section-title animate-slide-up">
                Help Us <span className="text-gradient">Improve</span>
              </h2>
              <p className="section-subtitle animate-fade-in">
                Your feedback helps us create better mental models and learning experiences
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Feedback Form */}
              <Card className="card-elevated">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent-secondary/10 rounded-xl flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Share Your Thoughts</h3>
                  </div>
                  
                  <textarea
                    value={userFeedback}
                    onChange={(e) => setUserFeedback(e.target.value)}
                    placeholder="What would you like to see improved? Any mental models you'd like us to add?"
                    className="w-full h-32 p-4 bg-background/80 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                  
                  <Button 
                    onClick={submitFeedback}
                    className="w-full mt-4 btn-hero"
                    disabled={!userFeedback.trim()}
                  >
                    Submit Feedback
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="card-elevated">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent-tertiary/20 to-primary/10 rounded-xl flex items-center justify-center">
                      <ThumbsUp className="w-6 h-6 text-accent-tertiary" />
                    </div>
                    <h3 className="text-xl font-semibold">Quick Actions</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover-glow"
                      onClick={() => toast({
                        title: "Thank you!",
                        description: "Your rating has been recorded.",
                      })}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Rate this experience (5/5)
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover-glow"
                      onClick={() => handleShare({ 
                        title: 'TopOne Academy - Mindset League', 
                        description: 'Discover mental models for better thinking' 
                      })}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share with friends
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover-glow"
                      onClick={() => toast({
                        title: "Subscribed!",
                        description: "You'll receive updates about new mental models.",
                      })}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Subscribe to updates
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VisualBusiness;