import SectionLayout from '@/components/SectionLayout';
import AIChat from '@/components/AIChat';
import AIContentAnalyzer from '@/components/AIContentAnalyzer';
import AIImageGenerator from '@/components/AIImageGenerator';
import PythonCompute from '@/components/PythonCompute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Languages,
  Image,
  MessageSquare,
  ArrowRight,
  Zap,
  Brain,
  Wand2
} from 'lucide-react';

const AITools = () => {
  const { user } = useAuth();

  const aiFeatures = [
    {
      title: "AI Image Generation",
      description: "Create stunning visuals with GPT-Image-1 for presentations, diagrams, and creative content",
      icon: Image,
      color: "text-primary",
      gradient: "from-primary/20 to-accent/10",
      link: "#image-generator"
    },
    {
      title: "AI Translation",
      description: "Powered by GPT-4.1 for accurate translations between Armenian, Russian, and English",
      icon: Languages,
      color: "text-accent-secondary",
      gradient: "from-accent-secondary/20 to-accent-tertiary/10",
      link: "/translator"
    },
    {
      title: "AI Chat Assistant",
      description: "Get instant help and guidance for your business learning journey",
      icon: MessageSquare,
      color: "text-accent-tertiary",
      gradient: "from-accent-tertiary/20 to-primary/10",
      link: "#chat-assistant"
    }
  ];

  const stats = [
    { number: "GPT-4.1", label: "Latest AI Model", icon: Brain, color: "text-primary" },
    { number: "GPT-Img-1", label: "Image Generation", icon: Wand2, color: "text-accent-secondary" },
    { number: "3", label: "AI Tools Available", icon: Sparkles, color: "text-accent-tertiary" }
  ];

  return (
    <SectionLayout 
      sectionName="AI Tools" 
      sectionIcon={Sparkles}
      sectionColor="from-primary to-accent-tertiary"
    >
      <div className="py-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-accent-tertiary/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-primary/20 shadow-lg animate-scale-in">
            <Sparkles className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-semibold text-gradient">AI-Powered Learning Tools</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-8 leading-[1.1] tracking-tight animate-slide-up">
            Enhanced with
            <br />
            <span className="text-gradient">Artificial Intelligence</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium max-w-4xl mx-auto mb-12 animate-fade-in">
            Leverage the latest AI models to enhance your learning experience with
            <span className="text-primary font-bold"> visual generation, translation, and intelligent assistance</span>
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center p-6 rounded-2xl card-glass hover-lift hover-glow group animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent-tertiary/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-gradient mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Features Overview */}
        <section className="mb-20">
          <div className="section-header mb-12">
            <h2 className="section-title animate-slide-up">
              Available <span className="text-gradient">AI Tools</span>
            </h2>
            <p className="section-subtitle animate-fade-in">
              Powerful AI-driven features to enhance your learning and productivity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {aiFeatures.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="card-elevated group hover-lift animate-scale-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardHeader className="p-6">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-display font-bold mb-3 text-center text-gradient-secondary">
                    {feature.title}
                  </CardTitle>
                  <p className="text-muted-foreground leading-relaxed text-center mb-6">
                    {feature.description}
                  </p>
                  
                  {feature.link.startsWith('#') ? (
                    <Button className="w-full btn-hero group" onClick={() => {
                      document.querySelector(feature.link)?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                      <span className="flex items-center gap-2">
                        Try Now
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  ) : (
                    <Button className="w-full btn-hero group" asChild>
                      <Link to={feature.link}>
                        <span className="flex items-center gap-2">
                          Open Tool
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </Link>
                    </Button>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Interactive AI Image Generator */}
        <section id="image-generator" className="mb-20">
          <div className="section-header mb-12">
            <h2 className="section-title animate-slide-up">
              <span className="text-gradient">AI Image</span> Generator
            </h2>
            <p className="section-subtitle animate-fade-in">
              Create stunning visuals instantly with GPT-Image-1
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-12 max-w-7xl mx-auto">
            <div className="lg:col-span-3">
              <AIImageGenerator />
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Quick Start Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <strong className="text-foreground">1. Describe your image:</strong>
                    <p className="text-muted-foreground">Be specific about style, colors, composition, and mood.</p>
                  </div>
                  <div>
                    <strong className="text-foreground">2. Generate:</strong>
                    <p className="text-muted-foreground">Click generate and wait for AI to create your image.</p>
                  </div>
                  <div>
                    <strong className="text-foreground">3. Download & Use:</strong>
                    <p className="text-muted-foreground">Save the image for presentations, content, or projects.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-glass">
                <CardHeader>
                  <CardTitle>Best Practices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Use descriptive adjectives (modern, clean, professional)</p>
                  <p>• Specify aspect ratio if needed (square, wide, tall)</p>
                  <p>• Mention lighting and mood (bright, dramatic, soft)</p>
                  <p>• Include style references (minimalist, corporate, artistic)</p>
                </CardContent>
              </Card>

              {!user && (
                <Card className="card-glass border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                  <CardContent className="p-6 text-center">
                    <Badge className="mb-3 bg-primary text-primary-foreground">Sign In Required</Badge>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create an account to access AI image generation and save your creations.
                    </p>
                    <Button size="sm" className="btn-hero" asChild>
                      <Link to="/dashboard">Get Started</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* Chat Assistant Preview */}
        <section id="chat-assistant" className="bg-gradient-to-b from-background via-muted/5 to-background rounded-3xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="text-gradient">AI Assistant</span> Coming Soon
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get instant help with your learning journey through our intelligent chat assistant
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Card className="card-elevated">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent-secondary rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">AI Assistant</p>
                      <p className="text-muted-foreground">
                        "I can help you with business concepts, provide explanations, create study plans, and answer questions about the course material. How can I assist you today?"
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="bg-primary/10 rounded-lg p-3 max-w-xs">
                      <p className="text-sm">
                        "Explain compound interest in simple terms"
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <Badge variant="secondary" className="bg-gradient-to-r from-accent-secondary/10 to-accent-tertiary/10">
                    Feature in Development
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </SectionLayout>
  );
};

export default AITools;