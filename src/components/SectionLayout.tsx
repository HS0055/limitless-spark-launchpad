import { ReactNode } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslation } from '@/contexts/TranslationContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { LoginForm } from '@/components/auth/LoginForm';
import { 
  BookOpen, 
  Settings,
  LogOut,
  Brain,
  TrendingUp,
  Image,
  Target
} from 'lucide-react';

interface SectionLayoutProps {
  children: ReactNode;
  sectionName: string;
  sectionIcon: any;
  sectionColor: string;
}

const SectionLayout = ({ children, sectionName, sectionIcon: SectionIcon, sectionColor }: SectionLayoutProps) => {
  const { user, signOut, loading } = useAuth();
  const { translate } = useTranslation();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{translate('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 bg-gradient-to-br ${sectionColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <SectionIcon className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{sectionName}</h1>
            <p className="text-muted-foreground">{translate('common.signIn')} to access this section</p>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${sectionColor.replace('from-', 'from-').replace('to-', 'to-')}/5`}>
      {/* Section Header */}
      <header className="bg-background/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Section Logo */}
            <div className="flex items-center space-x-3">
              <Link to="/dashboard" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground">
                <BookOpen className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <span className="text-muted-foreground">/</span>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 bg-gradient-to-br ${sectionColor} rounded-lg flex items-center justify-center`}>
                  <SectionIcon className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">{sectionName}</span>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-2">
              <LanguageSwitcher />
              <Button variant="ghost" size="sm" asChild>
                <Link to="/settings">
                  <Settings className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default SectionLayout;