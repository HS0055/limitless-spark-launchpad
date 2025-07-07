import SectionLayout from "@/components/SectionLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Users, BookOpen, Star, Play, ChevronRight, Target } from "lucide-react";
import { CulturalLeagueHero, CulturalLeagueStats, CulturalProgramsHeader } from "@/components/CulturalLeagueContent";

const League = () => {
  const programs = [
    {
      id: 1,
      title: "Business Fundamentals League",
      description: "Master the core principles of business including marketing, finance, operations, and strategy.",
      level: "Beginner",
      duration: "8 weeks",  
      students: 650,
      rating: 4.97,
      price: "$99",
      image: "business-fundamentals",
      status: "Available",
      lessons: 24,
      features: ["Visual Learning", "5-min Lessons", "Certificate", "Community Access"]
    },
    {
      id: 2,
      title: "Digital Marketing Mastery",
      description: "Learn modern digital marketing strategies, social media marketing, and analytics.",
      level: "Intermediate",
      duration: "10 weeks", 
      students: 420,
      rating: 4.92,
      price: "$149",
      image: "digital-marketing",
      status: "Available",
      lessons: 32,
      features: ["Real Projects", "Analytics Tools", "Campaign Building", "Expert Support"]
    },
    {
      id: 3,
      title: "Financial Planning Pro",
      description: "Advanced financial planning, investment strategies, and wealth management principles.",
      level: "Advanced",
      duration: "12 weeks",
      students: 280,
      rating: 4.95,
      price: "$199",
      image: "financial-planning",
      status: "Coming Soon",
      lessons: 36,
      features: ["Portfolio Analysis", "Risk Assessment", "Tax Planning", "1-on-1 Coaching"]
    }
  ];

  return (
    <SectionLayout 
      sectionName="Learning Leagues" 
      sectionIcon={Trophy}
      sectionColor="from-primary to-accent-secondary"
    >
      
      {/* Hero Section */}
      <section className="content-section pt-24 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-secondary/10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>
        
        <div className="content-container">
          <CulturalLeagueHero />
          <CulturalLeagueStats />
        </div>
      </section>

      {/* Programs Section */}
      <section className="content-section bg-gradient-to-b from-background via-muted/5 to-background">
        <div className="content-container">
          <CulturalProgramsHeader />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {programs.map((program, index) => (
              <Card 
                key={program.id} 
                className="card-elevated group hover-lift animate-scale-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardHeader className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge 
                      variant={program.level === 'Beginner' ? 'default' : program.level === 'Intermediate' ? 'secondary' : 'outline'}
                      className="font-semibold"
                    >
                      {program.level}
                    </Badge>
                    <Badge 
                      variant={program.status === 'Available' ? 'default' : 'secondary'}
                      className={program.status === 'Available' ? 'bg-primary text-primary-foreground' : ''}
                    >
                      {program.status}
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
                    <div className="text-2xl font-bold text-primary">{program.price}</div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-0">
                  <div className="space-y-2 mb-6">
                    {program.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 btn-hero font-semibold group" 
                      disabled={program.status !== 'Available'}
                    >
                      <span className="flex items-center gap-2">
                        {program.status === 'Available' ? 'Enroll Now' : 'Coming Soon'}
                        {program.status === 'Available' && (
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        )}
                      </span>
                    </Button>
                    <Button variant="outline" size="icon" className="hover-glow">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </SectionLayout>
  );
};

export default League;