import { Lock, Trophy, Rocket, Target, Briefcase, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const UpcomingLeagues = () => {
  const leagues = [
    {
      name: "Business Fundamentals",
      status: "active",
      icon: Trophy,
      description: "Master essential business concepts through visual learning",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      name: "Marketing Mastery",
      status: "coming-soon",
      icon: Target,
      description: "Visual strategies for effective marketing and growth",
      color: "text-muted-foreground",
      bgColor: "bg-muted/20"
    },
    {
      name: "Leadership Excellence",
      status: "coming-soon",
      icon: Users,
      description: "Build and lead high-performing teams",
      color: "text-muted-foreground",
      bgColor: "bg-muted/20"
    },
    {
      name: "Financial Intelligence",
      status: "coming-soon",
      icon: Briefcase,
      description: "Navigate business finances with confidence",
      color: "text-muted-foreground",
      bgColor: "bg-muted/20"
    },
    {
      name: "Innovation & Strategy",
      status: "coming-soon",
      icon: Rocket,
      description: "Drive innovation and strategic thinking",
      color: "text-muted-foreground",
      bgColor: "bg-muted/20"
    }
  ];

  return (
    <section className="content-section bg-gradient-to-b from-muted/10 to-background">
      <div className="content-container">
        <div className="section-header">
          <h2 className="section-title">
            Choose Your <span className="text-gradient">Learning Path</span>
          </h2>
          <p className="section-subtitle">
            Start with Business Fundamentals and unlock new leagues as you progress through TopOne Academy
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {leagues.map((league, index) => (
            <Card key={index} className={`relative card-elevated p-6 ${league.status === 'active' ? 'border-primary/30' : 'border-border'}`}>
              {league.status === 'coming-soon' && (
                <div className="absolute top-4 right-4">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              
              <CardContent className="p-0">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${league.bgColor} flex items-center justify-center`}>
                  <league.icon className={`w-8 h-8 ${league.color}`} />
                </div>
                
                <h3 className={`text-xl font-display font-semibold mb-3 text-center ${league.status === 'active' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {league.name}
                  {league.status === 'active' && (
                    <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                      ACTIVE
                    </span>
                  )}
                </h3>
                
                <p className={`text-center leading-relaxed ${league.status === 'active' ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                  {league.description}
                </p>
                
                {league.status === 'coming-soon' && (
                  <div className="text-center mt-4">
                    <span className="text-xs text-muted-foreground/60 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3" />
                      Unlocking Soon
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center bg-card/50 backdrop-blur-sm border border-border rounded-full px-6 py-3">
            <span className="text-sm text-muted-foreground">
              🎯 Complete leagues to unlock advanced content and earn certificates
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpcomingLeagues;