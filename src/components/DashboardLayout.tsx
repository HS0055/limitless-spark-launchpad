import { ReactNode } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslation } from '@/contexts/TranslationContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { 
  Home, 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Image, 
  Languages,
  Settings,
  LogOut,
  Menu
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const { translate } = useTranslation();
  const location = useLocation();

  const dashboardNavItems = [
    { name: translate('nav.home'), href: "/dashboard", icon: Home },
    { name: translate('nav.programs'), href: "/league", icon: Trophy },
    { name: translate('nav.visual'), href: "/visual-business", icon: Image },
    { name: translate('nav.business'), href: "/business-fundamentals", icon: BookOpen },
    { name: translate('nav.translator'), href: "/translator", icon: Languages },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Dashboard Header */}
      <header className="bg-background/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent-secondary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-bold">TopOne</span>
                <span className="text-xs text-muted-foreground block -mt-1">Dashboard</span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {dashboardNavItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

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

export default DashboardLayout;