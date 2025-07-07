import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Gamepad2, Crown, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

const LeaguesOverview = () => {
  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold">Learning Leagues</h2>
        <Link to="/league">
          <Button variant="outline" className="btn-outline-enhanced">
            <span className="flex items-center gap-2">
              View All Programs
              <ChevronRight className="w-4 h-4" />
            </span>
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="card-elevated hover-lift group">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent-secondary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gradient-secondary">Beginner League</h3>
                <p className="text-xs text-muted-foreground">Foundation Building</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Start your journey with essential mental models and decision-making frameworks.
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">12 Models</Badge>
              <div className="text-xs text-muted-foreground">2.1K participants</div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated hover-lift group">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-tertiary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Crown className="w-6 h-6 text-accent-tertiary" />
              </div>
              <div>
                <h3 className="font-semibold text-gradient-secondary">Advanced League</h3>
                <p className="text-xs text-muted-foreground">Strategic Mastery</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Deep dive into complex systems thinking and advanced cognitive strategies.
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="default">24 Models</Badge>
              <div className="text-xs text-muted-foreground">892 participants</div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated hover-lift group">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-secondary/20 to-accent-tertiary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Rocket className="w-6 h-6 text-accent-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-gradient-secondary">Elite League</h3>
                <p className="text-xs text-muted-foreground">Innovation & Leadership</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Master cutting-edge frameworks for innovation and strategic leadership.
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="outline">18 Models</Badge>
              <div className="text-xs text-muted-foreground">284 participants</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaguesOverview;