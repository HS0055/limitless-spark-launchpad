import Header from "@/components/Header";
import CompanyLogos from "@/components/CompanyLogos";
import UpcomingLeagues from "@/components/UpcomingLeagues";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Users, BookOpen, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  const stats = [
    { number: "5+", label: "Learning Leagues", icon: Trophy },
    { number: "650+", label: "Active Learners", icon: Users },
    { number: "4.97", label: "Average Rating", icon: Star },
    { number: "5 min", label: "Lesson Length", icon: BookOpen }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="content-section pt-24">
        <div className="content-container">
          <div className="section-header">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight">
              Welcome to
              <br />
              <span className="text-gradient">TopOne Academy</span>
            </h1>
            
            <div className="max-w-4xl mx-auto space-y-4 mb-8">
              <p className="text-xl md:text-2xl text-muted-foreground">
                Master essential skills through visual learning leagues designed for the modern professional
              </p>
              <p className="text-lg md:text-xl text-muted-foreground">
                Choose your path, unlock achievements, and{" "}
                <span className="text-primary font-semibold">transform your career</span> with bite-sized, engaging content.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button className="btn-hero text-lg px-8 py-4" asChild>
              <a href="/dashboard">
                🏆 Start Business League
              </a>
            </Button>
              <Button variant="outline" size="lg" className="text-muted-foreground border-muted hover:border-primary hover:text-primary">
                Explore All Leagues
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border">
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary mb-1">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CompanyLogos />
      <UpcomingLeagues />
      
      {/* How It Works */}
      <section className="content-section bg-gradient-to-b from-background to-muted/10">
        <div className="content-container">
          <div className="section-header">
            <h2 className="section-title">
              How <span className="text-gradient">TopOne Academy</span> Works
            </h2>
            <p className="section-subtitle">
              A structured approach to mastering business skills through visual learning and practical application
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="card-elevated p-8 text-center">
              <CardContent className="p-0">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-4">Choose Your League</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Start with Business Fundamentals or explore specialized leagues based on your career goals and interests.
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated p-8 text-center">
              <CardContent className="p-0">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-4">Learn Visually</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Engage with 5-minute visual lessons that break down complex concepts into digestible, memorable content.
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated p-8 text-center">
              <CardContent className="p-0">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-4">Unlock & Achieve</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Complete leagues, earn certificates, and unlock new learning paths as you advance through TopOne Academy.
                </p>
              </CardContent>
            </Card>
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