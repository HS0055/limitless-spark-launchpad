import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, Users, Target, DollarSign, Home, Settings, Trophy, TrendingUp, Image } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  const mainNavItems = [
    { name: t('nav.home'), href: "/", icon: Home },
    { name: t('nav.programs'), href: "/league", icon: Trophy },
    { name: t('nav.business'), href: "/business-fundamentals", icon: Target },
    { name: t('nav.memeCoins'), href: "/meme-coins", icon: TrendingUp },
    { name: t('nav.visual'), href: "/visual-business", icon: Image },
    { name: t('nav.aiTools'), href: "/ai-tools", icon: BookOpen },
  ];

  const secondaryNavItems = [
    { name: t('nav.community'), href: "#testimonials", icon: Users },
    { name: t('nav.pricing'), href: "#pricing", icon: DollarSign },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <nav className="content-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary via-accent-secondary to-accent-tertiary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <BookOpen className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-accent-tertiary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-display font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  TopOne <span className="text-primary">Academy</span>
                </span>
                <span className="text-xs text-muted-foreground font-medium">Mindset League</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Main Navigation */}
            <div className="flex items-center space-x-1 mr-6">
              {mainNavItems.map((item) => {
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 group relative ${
                      isActive 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-primary' : 'group-hover:text-primary'
                    }`} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Secondary Navigation */}
            <div className="flex items-center space-x-1 border-l border-border pl-6">
              {secondaryNavItems.map((item) => {
                const isExternal = item.href.startsWith('#');
                
                if (isExternal) {
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 flex items-center space-x-2 group"
                    >
                      <item.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                      <span className="font-medium">{item.name}</span>
                    </a>
                  );
                }
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 flex items-center space-x-2 group"
                  >
                    <item.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
            {user ? (
              <>
                <Link
                  to="/settings"
                  className={`hidden lg:flex p-2 rounded-lg transition-all duration-200 items-center space-x-2 group ${
                    location.pathname === '/settings' 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Settings className={`w-4 h-4 transition-colors ${
                    location.pathname === '/settings' ? 'text-primary' : 'group-hover:text-primary'
                  }`} />
                  <span className="font-medium">{t('nav.settings')}</span>
                </Link>
                <Button variant="outline" onClick={signOut} className="hidden lg:inline-flex font-medium">
                  {t('nav.signOut')}
                </Button>
              </>
            ) : (
              <Button className="hidden lg:inline-flex btn-hero font-semibold px-6" asChild>
                <Link to="/dashboard">
                  {t('nav.getStarted')}
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors border border-border"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border shadow-2xl">
            <div className="p-6 space-y-2">
              {/* Main Navigation */}
              <div className="space-y-1 mb-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">Navigation</h3>
                {mainNavItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-primary/10 text-primary border border-primary/20' 
                          : 'hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Secondary Navigation */}
              <div className="space-y-1 mb-6 pt-4 border-t border-border">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">More</h3>
                {secondaryNavItems.map((item) => {
                  const isExternal = item.href.startsWith('#');
                  
                  if (isExternal) {
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 p-4 rounded-xl hover:bg-muted/80 transition-all duration-200 text-muted-foreground hover:text-foreground"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </a>
                    );
                  }
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center space-x-3 p-4 rounded-xl hover:bg-muted/80 transition-all duration-200 text-muted-foreground hover:text-foreground"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-border space-y-3">
                {!user ? (
                  <Button className="w-full btn-hero font-semibold py-3" asChild>
                    <Link to="/dashboard">
                      {t('nav.getStarted')}
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Link
                      to="/settings"
                      className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${
                        location.pathname === '/settings' 
                          ? 'bg-primary/10 text-primary border border-primary/20' 
                          : 'hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className={`w-5 h-5 ${location.pathname === '/settings' ? 'text-primary' : ''}`} />
                      <span className="font-medium">{t('nav.settings')}</span>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full font-medium py-3" 
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                    >
                      {t('nav.signOut')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;