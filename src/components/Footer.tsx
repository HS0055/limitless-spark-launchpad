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
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Linkedin className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Mail className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Learning</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><button className="hover:text-primary transition-colors text-left">Courses</button></li>
              <li><button className="hover:text-primary transition-colors text-left">Community</button></li>
              <li><button className="hover:text-primary transition-colors text-left">Coaching</button></li>
              <li><button className="hover:text-primary transition-colors text-left">Downloads</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><button className="hover:text-primary transition-colors text-left">Help Center</button></li>
              <li><button className="hover:text-primary transition-colors text-left">Contact Us</button></li>
              <li><button className="hover:text-primary transition-colors text-left">Privacy Policy</button></li>
              <li><button className="hover:text-primary transition-colors text-left">Terms of Service</button></li>
            </ul>
          </div>
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