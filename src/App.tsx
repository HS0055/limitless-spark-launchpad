import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import Community from "./pages/Community";
import Settings from "./pages/Settings";
import League from "./pages/League";
import MemeCoins from "./pages/MemeCoins";
import VisualBusiness from "./pages/VisualBusiness";
import Translator from "./pages/Translator";
import AITools from "./pages/AITools";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <div className="min-h-screen bg-background">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/business-fundamentals" element={<Index />} />
                <Route path="/league" element={<League />} />
                <Route path="/meme-coins" element={<MemeCoins />} />
                <Route path="/visual-business" element={<VisualBusiness />} />
                <Route path="/translator" element={<Translator />} />
                <Route path="/ai-tools" element={<AITools />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/community" element={<Community />} />
                <Route path="/settings" element={<Settings />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
