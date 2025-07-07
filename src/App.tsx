import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AutoTranslateProvider } from "@/components/AutoTranslateProvider";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import Community from "./pages/Community";
import Settings from "./pages/Settings";
import League from "./pages/League";
import MemeCoins from "./pages/MemeCoins";
import VisualBusiness from "./pages/VisualBusiness";
import AITools from "./pages/AITools";
import NotFound from "./pages/NotFound";
import { WebScraperTranslator } from "./components/WebScraperTranslator";

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 2,
      retryDelay: 1000,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <LanguageProvider>
            <AutoTranslateProvider>
              <div className="min-h-screen bg-background">
                <Toaster />
                <Sonner />
                <PerformanceMonitor />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/business-fundamentals" element={<Index />} />
                    <Route path="/league" element={<League />} />
                    <Route path="/meme-coins" element={<MemeCoins />} />
                    <Route path="/visual-business" element={<VisualBusiness />} />
                    <Route path="/ai-tools" element={<AITools />} />
                    <Route path="/web-translator" element={<WebScraperTranslator />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/settings" element={<Settings />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </div>
            </AutoTranslateProvider>
          </LanguageProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
