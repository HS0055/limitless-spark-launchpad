import { Card, CardContent } from '@/components/ui/card';
import { Brain, Clock, Trophy, Target } from 'lucide-react';

interface LearningStats {
  totalModels: number;
  masteredModels: number;
  learningHours: number;
  streakDays: number;
  weeklyGoal: number;
}

interface DashboardStatsProps {
  stats: LearningStats;
}

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <Card className="card-elevated hover-lift">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Mental Models</p>
              <p className="text-3xl font-bold text-gradient">{stats.masteredModels}</p>
              <p className="text-xs text-muted-foreground">of {stats.totalModels} available</p>
            </div>
            <Brain className="w-10 h-10 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card className="card-elevated hover-lift">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Learning Hours</p>
              <p className="text-3xl font-bold text-gradient">{stats.learningHours}</p>
              <p className="text-xs text-muted-foreground">this month</p>
            </div>
            <Clock className="w-10 h-10 text-accent-secondary" />
          </div>
        </CardContent>
      </Card>

      <Card className="card-elevated hover-lift">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Streak Days</p>
              <p className="text-3xl font-bold text-gradient">{stats.streakDays}</p>
              <p className="text-xs text-muted-foreground">current streak</p>
            </div>
            <Trophy className="w-10 h-10 text-accent-tertiary" />
          </div>
        </CardContent>
      </Card>

      <Card className="card-elevated hover-lift">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Weekly Goal</p>
              <p className="text-3xl font-bold text-gradient">{stats.weeklyGoal}%</p>
              <p className="text-xs text-muted-foreground">almost there!</p>
            </div>
            <Target className="w-10 h-10 text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;