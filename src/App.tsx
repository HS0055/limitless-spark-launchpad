import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { AutoTranslateProvider } from "@/components/AutoTranslateProvider";
import { VisualEditor as GlobalVisualEditor } from "@/components/visual-editor/VisualEditor";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import Community from "./pages/Community";
import Settings from "./pages/Settings";
import League from "./pages/League";
import PythonToolsPage from "./pages/PythonToolsPage";
import MemeCoins from "./pages/MemeCoins";
import VisualBusiness from "./pages/VisualBusiness";
import AITools from "./pages/AITools";
import VisualEditor from "./pages/VisualEditor";
import NotFound from "./pages/NotFound";

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

// App content with global text editor
const AppContent = () => {
  const { userRole } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Sonner />
      <PerformanceMonitor />
      <BrowserRouter>
        <AutoTranslateProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/business-fundamentals" element={<Index />} />
            <Route path="/league" element={<League />} />
            <Route path="/python-tools" element={<PythonToolsPage />} />
            <Route path="/meme-coins" element={<MemeCoins />} />
            <Route path="/visual-business" element={<VisualBusiness />} />
            <Route path="/ai-tools" element={<AITools />} />
            <Route path="/editor" element={<VisualEditor />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/community" element={<Community />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Global Visual Editor - Available on all pages for admins */}
          {userRole === 'admin' && <GlobalVisualEditor />}
        </AutoTranslateProvider>
      </BrowserRouter>
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <LanguageProvider>
            <TranslationProvider>
              <AppContent />
            </TranslationProvider>
          </LanguageProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
