import { Button } from "@/components/ui/button";
import { Mail, Twitter, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center space-x-1">
                <div className="w-6 h-6 bg-primary rounded-sm"></div>
                <div className="w-6 h-6 bg-purple-500 rounded-sm"></div>
              </div>
              <span className="text-xl font-bold text-foreground">
                Limitless Concepts
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Empowering creative professionals with visual business education 
              that builds confidence and drives results.
            </p>
            <div className="flex space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-primary"
                aria-label="Follow us on Twitter"
                asChild
              >
                <a href="#" aria-label="Twitter">
                  <Twitter className="w-5 h-5" />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-primary"
                aria-label="Connect on LinkedIn"
                asChild
              >
                <a href="#" aria-label="LinkedIn">
                  <Linkedin className="w-5 h-5" />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-primary"
                aria-label="Follow on Instagram"
                asChild
              >
                <a href="#" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-primary"
                aria-label="Contact us by email"
                asChild
              >
                <a href="mailto:contact@limitlessconcepts.com" aria-label="Email">
                  <Mail className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>

          <nav aria-label="Learning navigation">
            <h4 className="font-semibold text-foreground mb-4">Learning</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/courses" className="hover:text-primary transition-colors">Courses</a></li>
              <li><a href="/community" className="hover:text-primary transition-colors">Community</a></li>
              <li><a href="/coaching" className="hover:text-primary transition-colors">Coaching</a></li>
              <li><a href="/downloads" className="hover:text-primary transition-colors">Downloads</a></li>
            </ul>
          </nav>

          <nav aria-label="Support navigation">
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/help" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="/contact" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </nav>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2024 Limitless Concepts. All rights reserved. Empowering creative professionals worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;