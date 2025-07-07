import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, Users, Target, DollarSign, Home, Settings, Trophy, TrendingUp, Image } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "League", href: "/league", icon: Trophy },
    { name: "Business League", href: "/business-fundamentals", icon: Target },
    { name: "Meme Coins", href: "/meme-coins", icon: TrendingUp },
    { name: "Visual Business", href: "/visual-business", icon: Image },
    { name: "Community", href: "#testimonials", icon: Users },
    { name: "Pricing", href: "#pricing", icon: DollarSign },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <nav className="content-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold">
                TopOne <span className="text-primary">Academy</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isExternal = item.href.startsWith('#');
              const isActive = !isExternal && location.pathname === item.href;
              
              if (isExternal) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center space-x-1 group"
                  >
                    <item.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                    <span>{item.name}</span>
                  </a>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`transition-colors duration-200 flex items-center space-x-1 group ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-primary' : 'group-hover:text-primary'
                  }`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/settings"
                  className={`transition-colors duration-200 flex items-center space-x-1 group ${
                    location.pathname === '/settings' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Settings className={`w-4 h-4 transition-colors ${
                    location.pathname === '/settings' ? 'text-primary' : 'group-hover:text-primary'
                  }`} />
                  <span>Settings</span>
                </Link>
                <Button variant="outline" onClick={signOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button className="btn-hero" asChild>
                <Link to="/dashboard">
                  Get Started
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border">
            <div className="p-4 space-y-4">
              {navItems.map((item) => {
                const isExternal = item.href.startsWith('#');
                const isActive = !isExternal && location.pathname === item.href;
                
                if (isExternal) {
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5 text-primary" />
                      <span>{item.name}</span>
                    </a>
                  );
                }
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive ? 'bg-muted text-primary' : 'hover:bg-muted'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-primary'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <Button className="w-full btn-hero mt-4" asChild>
                <Link to="/dashboard">
                  Get Started
                </Link>
              </Button>
              {user && (
                <>
                  <Link
                    to="/settings"
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      location.pathname === '/settings' ? 'bg-muted text-primary' : 'hover:bg-muted'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className={`w-5 h-5 ${location.pathname === '/settings' ? 'text-primary' : 'text-primary'}`} />
                    <span>Settings</span>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2" 
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;