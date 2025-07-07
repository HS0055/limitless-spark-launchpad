import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Share2, Download, Eye, Heart, BarChart3, PieChart, TrendingUp, Image, Video, FileText, Sparkles } from "lucide-react";

const VisualBusiness = () => {
  const contentCategories = [
    { name: "Infographics", count: 156, icon: Image, color: "text-primary" },
    { name: "Videos", count: 89, icon: Video, color: "text-accent-secondary" },
    { name: "Presentations", count: 72, icon: FileText, color: "text-accent-tertiary" },
    { name: "Charts & Graphs", count: 134, icon: BarChart3, color: "text-primary" }
  ];

  const featuredContent = [
    {
      id: 1,
      title: "The Ultimate Guide to Business Model Canvas",
      type: "Infographic",
      description: "Visual breakdown of the 9 building blocks of any successful business model",
      views: "15.2K",
      likes: 892,
      shares: 156,
      duration: null,
      image: "business-model-canvas",
      author: "BusinessViz",
      category: "Strategy"
    },
    {
      id: 2,
      title: "5-Minute Marketing Funnel Explained", 
      type: "Video",
      description: "Animated explanation of how customers move through your marketing funnel",
      views: "23.8K",
      likes: 1245,
      shares: 289,
      duration: "5:32",
      image: "marketing-funnel",
      author: "MarketingPro",
      category: "Marketing"
    },
    {
      id: 3,
      title: "Financial Statements Made Simple",
      type: "Interactive",
      description: "Interactive presentation breaking down P&L, Balance Sheet, and Cash Flow",
      views: "18.4K",
      likes: 967,
      shares: 203,
      duration: null,
      image: "financial-statements",
      author: "FinanceGuru",
      category: "Finance"
    },
    {
      id: 4,
      title: "Startup Valuation Methods Comparison",
      type: "Chart",
      description: "Visual comparison of different startup valuation methodologies",
      views: "12.1K", 
      likes: 634,
      shares: 98,
      duration: null,
      image: "valuation-methods",
      author: "StartupExpert",
      category: "Investment"
    }
  ];

  const trendingTopics = [
    { name: "Digital Transformation", posts: 45, trend: "+12%" },
    { name: "Remote Work Culture", posts: 38, trend: "+8%" },
    { name: "Sustainable Business", posts: 29, trend: "+15%" },
    { name: "AI in Business", posts: 52, trend: "+23%" },
    { name: "Customer Experience", posts: 33, trend: "+6%" }
  ];

  const stats = [
    { number: "451", label: "Visual Resources", icon: Sparkles, color: "text-primary" },
    { number: "89.3K", label: "Total Views", icon: Eye, color: "text-accent-secondary" },
    { number: "5.2K", label: "Community Shares", icon: Share2, color: "text-accent-tertiary" },
    { number: "2.8K", label: "Downloads", icon: Download, color: "text-primary" }
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
              <Image className="w-4 h-4 text-accent-tertiary mr-2" />
              <span className="text-sm font-semibold text-gradient">🎨 Visual Learning Hub</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-8 leading-[1.1] tracking-tight animate-slide-up">
              Visual
              <br />
              <span className="text-gradient">Business</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium max-w-4xl mx-auto mb-12 animate-fade-in">
              Transform complex business concepts into engaging visual content. 
              <span className="text-accent-tertiary font-bold"> Discover, create, and share</span> infographics, videos, and interactive presentations.
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

      {/* Content Categories */}
      <section className="content-section bg-gradient-to-b from-background via-muted/5 to-background">
        <div className="content-container">
          <div className="section-header mb-16">
            <h2 className="section-title animate-slide-up">
              Content <span className="text-gradient">Categories</span>
            </h2>
            <p className="section-subtitle animate-fade-in">
              Explore our diverse collection of visual business content
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
            {contentCategories.map((category, index) => (
              <Card 
                key={category.name} 
                className="card-elevated hover-lift group animate-scale-in cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <category.icon className={`w-8 h-8 ${category.color}`} />
                  </div>
                  <h3 className="text-lg font-display font-bold mb-2 text-gradient-secondary">{category.name}</h3>
                  <p className="text-2xl font-bold text-primary mb-1">{category.count}</p>
                  <p className="text-sm text-muted-foreground">Resources</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="content-section">
        <div className="content-container">
          <div className="section-header mb-16">
            <h2 className="section-title animate-slide-up">
              <span className="text-gradient">Featured</span> Content
            </h2>
            <p className="section-subtitle animate-fade-in">
              Our most popular and engaging visual business resources
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
            {featuredContent.map((content, index) => (
              <Card 
                key={content.id} 
                className="card-elevated hover-lift group animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="font-medium">
                      {content.category}
                    </Badge>
                    <Badge variant={content.type === 'Video' ? 'default' : 'secondary'}>
                      {content.type}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-xl font-display font-bold mb-3 text-gradient-secondary">
                    {content.title}
                  </CardTitle>
                  
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {content.description}
                  </p>

                  <div className="text-sm text-muted-foreground mb-4">
                    by <span className="font-semibold text-foreground">{content.author}</span>
                    {content.duration && <span> • {content.duration}</span>}
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-0">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{content.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{content.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        <span>{content.shares}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1 btn-hero font-semibold group">
                      <span className="flex items-center gap-2">
                        {content.type === 'Video' ? <Play className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {content.type === 'Video' ? 'Watch' : 'View'}
                      </span>
                    </Button>
                    <Button variant="outline" size="icon" className="hover-glow">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="hover-glow">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Topics */}
      <section className="content-section bg-gradient-to-b from-muted/5 to-background">
        <div className="content-container">
          <div className="grid lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              <h3 className="text-3xl font-display font-bold mb-8 text-gradient-secondary">Create & Share</h3>
              <div className="space-y-6">
                <Card className="card-glass">
                  <CardContent className="p-8">
                    <h4 className="text-xl font-semibold mb-4">Upload Your Visual Content</h4>
                    <p className="text-muted-foreground mb-6">
                      Share your business infographics, presentations, and videos with the community. 
                      Get feedback, earn recognition, and help others learn visually.
                    </p>
                    <div className="flex gap-4">
                      <Button className="btn-hero">
                        <span className="flex items-center gap-2">
                          <PieChart className="w-4 h-4" />
                          Upload Content
                        </span>
                      </Button>
                      <Button variant="outline">View Guidelines</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-glass">
                  <CardContent className="p-8">
                    <h4 className="text-xl font-semibold mb-4">Request Custom Visuals</h4>
                    <p className="text-muted-foreground mb-6">
                      Need a specific business concept visualized? Submit a request and our community 
                      of creators will help bring your ideas to life.
                    </p>
                    <Button variant="outline" className="btn-outline-enhanced">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Make a Request
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-display font-bold mb-8 text-gradient-secondary">Trending Topics</h3>
              <div className="space-y-4">
                {trendingTopics.map((topic, index) => (
                  <Card key={index} className="card-glass hover-lift">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">{topic.name}</h4>
                          <p className="text-sm text-muted-foreground">{topic.posts} posts</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-accent-tertiary" />
                          <span className="text-sm font-semibold text-accent-tertiary">{topic.trend}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button className="w-full mt-6 btn-hero">
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Explore All Topics
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