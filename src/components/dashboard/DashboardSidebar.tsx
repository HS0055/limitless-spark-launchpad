import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, Award, Trophy, Users, Lock, Unlock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Achievement {
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface DashboardSidebarProps {
  nextGoal: string;
  achievements: Achievement[];
}

const DashboardSidebar = ({ nextGoal, achievements }: DashboardSidebarProps) => {
  return (
    <div className="space-y-6">
      {/* Next Goal */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Next Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{nextGoal}</p>
          <Progress value={80} className="mb-2" />
          <p className="text-xs text-muted-foreground">3 more to go!</p>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-accent-tertiary" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {achievements.map((achievement, index) => (
            <div key={index} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              achievement.unlocked ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
            }`}>
              <div className={`text-xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                {achievement.unlocked ? achievement.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {achievement.title}
                </h4>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              </div>
              {achievement.unlocked && <Unlock className="w-4 h-4 text-primary" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link to="/league">
            <Button variant="outline" className="w-full justify-start hover-glow">
              <Trophy className="w-4 h-4 mr-2" />
              Browse Programs
            </Button>
          </Link>
          <Link to="/community">
            <Button variant="outline" className="w-full justify-start hover-glow">
              <Users className="w-4 h-4 mr-2" />
              Join Community
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="outline" className="w-full justify-start hover-glow">
              <Target className="w-4 h-4 mr-2" />
              Set Goals
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSidebar;