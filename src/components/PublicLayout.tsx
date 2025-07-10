import { ReactNode } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { 
  BookOpen, 
  LogIn, 
  LogOut,
  User
} from 'lucide-react';

interface PublicLayoutProps {
  children: ReactNode;
  sectionName: string;
  sectionIcon: any;
  sectionColor: string;
}

const PublicLayout = ({ children, sectionName, sectionIcon: SectionIcon, sectionColor }: PublicLayoutProps) => {
  const { user, signOut, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/dashboard'); // This will redirect to login if not authenticated
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${sectionColor.replace('from-', 'from-').replace('to-', 'to-')}/5`}>
      {/* Public Header */}
      <header className="bg-background/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Section Logo */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground">
                <BookOpen className="w-4 h-4" />
                <span>Home</span>
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
              
              {!loading && (
                <>
                  {user ? (
                    <>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/dashboard">
                          <User className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={signOut}>
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={handleAuthAction}>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
};

export default PublicLayout;