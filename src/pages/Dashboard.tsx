import { useAuth } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import AschConformityVisualization from '@/components/AschConformityVisualization';
import DashboardStats from '@/components/dashboard/DashboardStats';
import LeaguesOverview from '@/components/dashboard/LeaguesOverview';
import MentalModelsList from '@/components/dashboard/MentalModelsList';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';


const Dashboard = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  
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
    <DashboardLayout>
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-display font-bold mb-2">
                {t('dashboard.welcome')} <span className="text-gradient">Thinker!</span>
              </h1>
              <p className="text-xl text-muted-foreground">{t('dashboard.subtitle')}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{learningStats.streakDays}</div>
                <div className="text-sm text-muted-foreground">{t('dashboard.dayStreak')} 🔥</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <DashboardStats stats={learningStats} />

        {/* Leagues Overview */}
        <LeaguesOverview />

        {/* Asch Conformity Visualization */}
        <div className="mb-12">
          <AschConformityVisualization />
        </div>

        {/* Learning Progress */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <MentalModelsList models={mockMentalModels} />
          
          {/* Sidebar */}
          <DashboardSidebar 
            nextGoal={learningStats.nextGoal}
            achievements={mockAchievements}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;