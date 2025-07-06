import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <div className="w-6 h-6 bg-primary rounded-sm"></div>
          <div className="w-6 h-6 bg-purple-500 rounded-sm"></div>
        </div>
        <span className="text-xl font-bold text-foreground">
          Limitless Concepts
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
          <LogIn className="w-4 h-4 mr-2" />
          Log In
        </Button>
        <Button variant="hero">
          Access for $37
        </Button>
      </div>
    </header>
  );
};

export default Header;