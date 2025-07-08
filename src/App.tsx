import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { AutoTranslateProvider } from "@/components/AutoTranslateProvider";
import { Suspense, lazy } from "react";

// Core pages (loaded immediately)
import Home from "./pages/Home";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Heavy pages (lazy loaded)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Community = lazy(() => import("./pages/Community"));
const Settings = lazy(() => import("./pages/Settings"));
const League = lazy(() => import("./pages/League"));
const PythonToolsPage = lazy(() => import("./pages/PythonToolsPage"));
const MemeCoins = lazy(() => import("./pages/MemeCoins"));
const VisualBusiness = lazy(() => import("./pages/VisualBusiness"));
const AITools = lazy(() => import("./pages/AITools"));
const EditorApp = lazy(() => import("./pages/EditorApp"));
const WebEditor = lazy(() => import("./pages/WebEditor"));
const AIContentStudio = lazy(() => import("./pages/AIContentStudio"));
const BugTracker = lazy(() => import("./pages/BugTracker"));
const ContentDetector = lazy(() => import("./pages/ContentDetector"));
const WebsiteScraper = lazy(() => import("./pages/WebsiteScraper"));
const GlobalVisualEditor = lazy(() => import("@/components/visual-editor/VisualEditor").then(module => ({ default: module.VisualEditor })));
const TranslationHealthDashboard = lazy(() => import("./components/TranslationHealthDashboard").then(module => ({ default: module.TranslationHealthDashboard })));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

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
      {/* PerformanceMonitor disabled by default for production performance */}
      {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
      <BrowserRouter>
        <AutoTranslateProvider config={{
          enabled: true,
          interval: 5, // Check every 5 minutes
          maxTextsPerBatch: 30,
          enabledLanguages: ['hy', 'ru', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ar', 'pt', 'it', 'nl', 'pl', 'tr', 'hi', 'th', 'vi', 'sv', 'da', 'no', 'fi', 'he', 'id', 'ms', 'uk', 'cs', 'sk', 'ro', 'bg', 'hr', 'sr', 'sl', 'et', 'lv', 'lt', 'hu', 'mt', 'ga', 'cy', 'is', 'mk', 'sq', 'eu', 'ca', 'gl', 'sw', 'zu', 'af', 'bn', 'gu', 'kn', 'ml', 'mr', 'pa', 'ta', 'te', 'ur'],
          enableFullSiteScan: false // Set to true for comprehensive scanning
        }}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/business-fundamentals" element={<Index />} />
              <Route path="/league" element={<League />} />
              <Route path="/python-tools" element={<PythonToolsPage />} />
              <Route path="/meme-coins" element={<MemeCoins />} />
              <Route path="/visual-business" element={<VisualBusiness />} />
              <Route path="/ai-tools" element={<AITools />} />
              <Route path="/editor" element={<EditorApp />} />
              <Route path="/web-editor" element={<WebEditor />} />
              <Route path="/ai-content-studio" element={<AIContentStudio />} />
              <Route path="/content-detector" element={<ContentDetector />} />
              <Route path="/website-scraper" element={<WebsiteScraper />} />
              <Route path="/translation-health" element={<TranslationHealthDashboard />} />
              <Route path="/bug-tracker" element={<BugTracker />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/community" element={<Community />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          
          {/* Global Visual Editor - Available on all pages for admins */}
          {userRole === 'admin' && (
            <Suspense fallback={null}>
              <GlobalVisualEditor />
            </Suspense>
          )}
        </AutoTranslateProvider>
      </BrowserRouter>
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TranslationProvider>
          <AppContent />
        </TranslationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
