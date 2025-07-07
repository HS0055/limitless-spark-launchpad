import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Database, 
  Globe, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  BarChart3,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PerformanceMetrics {
  cacheHitRate: number;
  avgTranslationTime: number;
  totalTranslations: number;
  languagePairs: number;
  errorRate: number;
  apiCalls: number;
  cacheSize: number;
}

interface LanguageStats {
  code: string;
  name: string;
  flag: string;
  translations: number;
  avgTime: number;
  cacheHit: number;
}

const TranslationPerformanceDashboard = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cacheHitRate: 85,
    avgTranslationTime: 1.2,
    totalTranslations: 1456,
    languagePairs: 6,
    errorRate: 2.1,
    apiCalls: 234,
    cacheSize: 2.4
  });

  const [languageStats, setLanguageStats] = useState<LanguageStats[]>([
    { code: 'en', name: 'English', flag: '🇺🇸', translations: 856, avgTime: 0.8, cacheHit: 92 },
    { code: 'hy', name: 'Armenian', flag: '🇦🇲', translations: 342, avgTime: 1.4, cacheHit: 78 },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', translations: 258, avgTime: 1.6, cacheHit: 81 }
  ]);

  const [realTimeStats, setRealTimeStats] = useState({
    activeTranslations: 0,
    queuedRequests: 0,
    lastUpdate: new Date()
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeStats(prev => ({
        ...prev,
        activeTranslations: Math.floor(Math.random() * 5),
        queuedRequests: Math.floor(Math.random() * 3),
        lastUpdate: new Date()
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const optimizeCache = async () => {
    toast({
      title: "Cache Optimization Started",
      description: "Cleaning up unused translations and optimizing storage...",
    });

    // Simulate optimization process
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        cacheHitRate: Math.min(prev.cacheHitRate + 5, 95),
        cacheSize: prev.cacheSize * 0.8
      }));

      toast({
        title: "Cache Optimized",
        description: "Cache hit rate improved and storage optimized",
      });
    }, 2000);
  };

  const clearCache = async () => {
    localStorage.removeItem('translation-cache');
    setMetrics(prev => ({
      ...prev,
      cacheHitRate: 0,
      cacheSize: 0
    }));

    toast({
      title: "Cache Cleared",
      description: "All cached translations have been removed",
      variant: "destructive"
    });
  };

  const getPerformanceColor = (value: number, threshold: number, invert = false) => {
    const isGood = invert ? value < threshold : value > threshold;
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Translation Performance</h2>
          <p className="text-muted-foreground">
            Monitor and optimize your translation system performance
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Activity className="w-3 h-3 mr-1" />
            System Online
          </Badge>
          <Badge variant="outline">
            Last updated: {realTimeStats.lastUpdate.toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cache Hit Rate</p>
                    <p className={`text-2xl font-bold ${getPerformanceColor(metrics.cacheHitRate, 80)}`}>
                      {metrics.cacheHitRate}%
                    </p>
                  </div>
                  <Database className="w-8 h-8 text-muted-foreground" />
                </div>
                <Progress value={metrics.cacheHitRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Speed</p>
                    <p className={`text-2xl font-bold ${getPerformanceColor(metrics.avgTranslationTime, 2, true)}`}>
                      {metrics.avgTranslationTime}s
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Target: &lt;2.0s
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Translations</p>
                    <p className="text-2xl font-bold text-primary">
                      {metrics.totalTranslations.toLocaleString()}
                    </p>
                  </div>
                  <Globe className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="text-xs text-green-600 mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% this week
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                    <p className={`text-2xl font-bold ${getPerformanceColor(metrics.errorRate, 5, true)}`}>
                      {metrics.errorRate}%
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Target: &lt;5%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Real-time Activity
              </CardTitle>
              <CardDescription>
                Current translation activity and system status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Translations</span>
                    <Badge variant={realTimeStats.activeTranslations > 0 ? "default" : "secondary"}>
                      {realTimeStats.activeTranslations}
                    </Badge>
                  </div>
                  <Progress value={realTimeStats.activeTranslations * 20} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Queued Requests</span>
                    <Badge variant={realTimeStats.queuedRequests > 0 ? "destructive" : "secondary"}>
                      {realTimeStats.queuedRequests}
                    </Badge>
                  </div>
                  <Progress value={realTimeStats.queuedRequests * 33} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">System Load</span>
                    <Badge variant="outline">
                      Normal
                    </Badge>
                  </div>
                  <Progress value={35} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Language Performance</CardTitle>
              <CardDescription>
                Translation performance breakdown by language
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {languageStats.map((lang) => (
                  <div key={lang.code} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <h3 className="font-semibold">{lang.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {lang.translations} translations
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {lang.avgTime}s avg
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {lang.cacheHit}% cached
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Cache Hit Rate</span>
                        <span>{lang.cacheHit}%</span>
                      </div>
                      <Progress value={lang.cacheHit} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cache Statistics</CardTitle>
                <CardDescription>
                  Current cache usage and performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Cache Size</span>
                  <span className="text-sm text-muted-foreground">{metrics.cacheSize}MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Hit Rate</span>
                  <span className="text-sm font-bold text-green-600">{metrics.cacheHitRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">API Calls Saved</span>
                  <span className="text-sm text-primary">{Math.round(metrics.totalTranslations * metrics.cacheHitRate / 100)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Management</CardTitle>
                <CardDescription>
                  Optimize and manage translation cache
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={optimizeCache} className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Optimize Cache
                </Button>
                <Button variant="outline" onClick={clearCache} className="w-full">
                  <Database className="w-4 h-4 mr-2" />
                  Clear Cache
                </Button>
                <div className="text-xs text-muted-foreground">
                  Cache optimization improves hit rates and reduces storage usage
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Performance Settings
              </CardTitle>
              <CardDescription>
                Configure translation system performance parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Batch Size</h4>
                    <p className="text-xs text-muted-foreground">
                      Number of translations processed simultaneously
                    </p>
                  </div>
                  <Badge variant="outline">5</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Cache TTL</h4>
                    <p className="text-xs text-muted-foreground">
                      How long translations are cached
                    </p>
                  </div>
                  <Badge variant="outline">30 days</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">API Model</h4>
                    <p className="text-xs text-muted-foreground">
                      Current AI model for translations
                    </p>
                  </div>
                  <Badge variant="outline">GPT-4.1-Mini</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Rate Limiting</h4>
                    <p className="text-xs text-muted-foreground">
                      Requests per minute limit
                    </p>
                  </div>
                  <Badge variant="outline">60 RPM</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TranslationPerformanceDashboard;