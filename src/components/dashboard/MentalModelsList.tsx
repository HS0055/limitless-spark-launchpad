import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Star, Heart, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MentalModel {
  id: number;
  title: string;
  category: string;
  description: string;
  progress: number;
  icon: string;
  difficulty: string;
  lessons: number;
  completedLessons: number;
  timeSpent: string;
  rating: number;
}

interface MentalModelsListProps {
  models: MentalModel[];
}

const MentalModelsList = ({ models }: MentalModelsListProps) => {
  return (
    <div className="lg:col-span-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold">Your Mental Models</h2>
        <Link to="/visual-business">
          <Button variant="outline" className="btn-outline-enhanced">
            <span className="flex items-center gap-2">
              Browse All
              <ChevronRight className="w-4 h-4" />
            </span>
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {models.map((model) => (
          <Card key={model.id} className="card-glass hover-lift">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">{model.icon}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{model.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{model.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{model.category}</span>
                        <span>•</span>
                        <span>{model.difficulty}</span>
                        <span>•</span>
                        <span>{model.completedLessons}/{model.lessons} lessons</span>
                        <span>•</span>
                        <span>{model.timeSpent}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current text-yellow-500" />
                        <span className="text-sm font-medium">{model.rating}</span>
                      </div>
                      <Badge variant={model.progress === 100 ? 'default' : 'secondary'}>
                        {model.progress === 100 ? 'Mastered' : 'In Progress'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{model.progress}%</span>
                    </div>
                    <Progress value={model.progress} className="h-2" />
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1" variant={model.progress === 100 ? 'outline' : 'default'}>
                      <Play className="w-4 h-4 mr-2" />
                      {model.progress === 100 ? 'Review' : 'Continue'}
                    </Button>
                    <Button variant="outline" size="icon" className="hover-glow">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MentalModelsList;