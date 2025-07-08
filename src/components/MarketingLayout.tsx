import { ReactNode } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Sparkles } from 'lucide-react';
import Footer from '@/components/Footer';

interface MarketingLayoutProps {
  children: ReactNode;
}

const MarketingLayout = ({ children }: MarketingLayoutProps) => {
  const { translate } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Simplified Marketing Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent-secondary rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  TopOne <span className="text-primary">Academy</span>
                </span>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <nav className="hidden md:flex items-center space-x-4 mr-4">
                <Link to="/league" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  {translate('nav.programs')}
                </Link>
                <Link to="/visual-business" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  {translate('nav.visual')}
                </Link>
                <Link to="/meme-coins" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Meme Coins
                </Link>
                <Link to="/ai-tools" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  AI Tools
                </Link>
                <Link to="/business-fundamentals" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  {translate('nav.business')}
                </Link>
              </nav>
              <Button className="btn-hero font-semibold px-6" asChild>
                <Link to="/dashboard">{translate('nav.getStarted')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default MarketingLayout;