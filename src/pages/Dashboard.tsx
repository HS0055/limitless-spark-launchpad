import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Trophy, Users, Play, Brain, Target, Lightbulb, TrendingUp, Star, Eye, Heart, Zap, Award, ChevronRight, Lock, Unlock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  category: string;
  level: string;
  progress: number;
  enrolled_at: string;
  instructor: {
    display_name: string;
  };
  _count: {
    lessons: number;
  };
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  
  // Mock data for demonstration - ready content
  const mockMentalModels = [
    {
      id: 1,
      title: "First Principles Thinking",
      category: "Innovation",
      description: "Break down complex problems into fundamental truths",
      progress: 85,
      icon: "🏗️",
      difficulty: "Advanced",
      lessons: 8,
      completedLessons: 7,
      timeSpent: "2.5 hours",
      rating: 4.9
    },
    {
      id: 2,
      title: "Pareto Principle (80/20)",
      category: "Productivity",
      description: "Focus on what matters most for maximum impact",
      progress: 100,
      icon: "📊",
      difficulty: "Beginner",
      lessons: 5,
      completedLessons: 5,
      timeSpent: "1.8 hours",
      rating: 4.8
    },
    {
      id: 3,
      title: "Systems Thinking",
      category: "Analysis",
      description: "Understand interconnections and patterns",
      progress: 45,
      icon: "🔗",
      difficulty: "Advanced",
      lessons: 12,
      completedLessons: 5,
      timeSpent: "3.2 hours",
      rating: 4.7
    },
    {
      id: 4,
      title: "Inversion Thinking",
      category: "Problem Solving",
      description: "Approach problems by considering what to avoid",
      progress: 0,
      icon: "🔄",
      difficulty: "Intermediate",
      lessons: 6,
      completedLessons: 0,
      timeSpent: "0 hours",
      rating: 4.6
    }
  ];

  const mockAchievements = [
    { title: "First Mental Model", description: "Completed your first mental model", icon: "🎯", unlocked: true },
    { title: "Streak Master", description: "Maintained a 7-day learning streak", icon: "🔥", unlocked: true },
    { title: "Critical Thinker", description: "Mastered 5 decision-making models", icon: "🧠", unlocked: false },
    { title: "Strategic Mind", description: "Completed business strategy models", icon: "♟️", unlocked: false }
  ];

  const learningStats = {
    totalModels: 142,
    masteredModels: 12,
    learningHours: 24.5,
    streakDays: 12,
    nextGoal: "Master 15 mental models",
    weeklyGoal: 85 // percentage
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome to TopOne Academy</h1>
            <p className="text-muted-foreground">Sign in to unlock your mindset dashboard</p>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="content-container py-8 pt-24">
        {/* Enhanced Header */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-display font-bold mb-2">
                Welcome back, <span className="text-gradient">Thinker!</span>
              </h1>
              <p className="text-xl text-muted-foreground">Continue building your unique mind</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{learningStats.streakDays}</div>
                <div className="text-sm text-muted-foreground">Day Streak 🔥</div>
              </div>
              <Link to="/visual-business">
                <Button className="btn-hero">
                  <Brain className="w-4 h-4 mr-2" />
                  Explore Models
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="card-elevated hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Mental Models</p>
                  <p className="text-3xl font-bold text-gradient">{learningStats.masteredModels}</p>
                  <p className="text-xs text-muted-foreground">of {learningStats.totalModels} available</p>
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
                  <p className="text-3xl font-bold text-gradient">{learningStats.learningHours}</p>
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
                  <p className="text-3xl font-bold text-gradient">{learningStats.streakDays}</p>
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
                  <p className="text-3xl font-bold text-gradient">{learningStats.weeklyGoal}%</p>
                  <p className="text-xs text-muted-foreground">almost there!</p>
                </div>
                <Target className="w-10 h-10 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Progress */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
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
              {mockMentalModels.map((model) => (
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

          {/* Sidebar */}
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
                <p className="text-sm text-muted-foreground mb-4">{learningStats.nextGoal}</p>
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
                {mockAchievements.map((achievement, index) => (
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;