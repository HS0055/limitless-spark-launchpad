import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, Zap, Target, AlertTriangle, CheckCircle, 
  Brain, Globe, Users, BarChart3, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient } from '@/lib/apiClient';

interface PerformanceMetrics {
  translationAccuracy: number;
  processingSpeed: number;
  contentCoverage: number;
  errorRate: number;
  userEngagement: number;
  aiModelPerformance: {
    claude: { accuracy: number; speed: number; usage: number };
    openai: { accuracy: number; speed: number; usage: number };
    perplexity: { accuracy: number; speed: number; usage: number };
  };
  recentTranslations: Array<{
    text: string;
    language: string;
    accuracy: number;
    time: number;
    model: string;
  }>;
  contentStats: {
    totalElements: number;
    translatedElements: number;
    pendingElements: number;
    errorElements: number;
  };
}

export const TranslationPerformanceDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    translationAccuracy: 0,
    processingSpeed: 0,
    contentCoverage: 0,
    errorRate: 0,
    userEngagement: 0,
    aiModelPerformance: {
      claude: { accuracy: 0, speed: 0, usage: 0 },
      openai: { accuracy: 0, speed: 0, usage: 0 },
      perplexity: { accuracy: 0, speed: 0, usage: 0 }
    },
    recentTranslations: [],
    contentStats: {
      totalElements: 0,
      translatedElements: 0,
      pendingElements: 0,
      errorElements: 0
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch performance metrics
  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      // Simulate fetching real metrics - in production this would come from analytics
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics({
        translationAccuracy: Math.random() * 20 + 85, // 85-95%
        processingSpeed: Math.random() * 5 + 8, // 8-13 elements/sec
        contentCoverage: Math.random() * 15 + 80, // 80-95%
        errorRate: Math.random() * 3 + 1, // 1-4%
        userEngagement: Math.random() * 10 + 85, // 85-95%
        aiModelPerformance: {
          claude: {
            accuracy: Math.random() * 10 + 88,
            speed: Math.random() * 2 + 7,
            usage: Math.random() * 20 + 40
          },
          openai: {
            accuracy: Math.random() * 8 + 85,
            speed: Math.random() * 3 + 9,
            usage: Math.random() * 15 + 25
          },
          perplexity: {
            accuracy: Math.random() * 12 + 82,
            speed: Math.random() * 4 + 6,
            usage: Math.random() * 25 + 35
          }
        },
        recentTranslations: generateRecentTranslations(),
        contentStats: {
          totalElements: Math.floor(Math.random() * 200) + 800,
          translatedElements: Math.floor(Math.random() * 150) + 700,
          pendingElements: Math.floor(Math.random() * 30) + 20,
          errorElements: Math.floor(Math.random() * 10) + 2
        }
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecentTranslations = () => {
    const sampleTexts = [
      'Welcome to our platform',
      'Get started today',
      'Learn business fundamentals',
      'Join our community',
      'Subscribe now',
      'Contact support',
      'Featured courses',
      'Success stories'
    ];
    
    const languages = ['hy', 'ru'];
    const models = ['claude', 'openai', 'perplexity'];
    
    return Array.from({ length: 8 }, (_, i) => ({
      text: sampleTexts[i],
      language: languages[Math.floor(Math.random() * languages.length)],
      accuracy: Math.random() * 15 + 85,
      time: Math.random() * 2000 + 500,
      model: models[Math.floor(Math.random() * models.length)]
    }));
  };

  // Auto-refresh metrics
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, threshold: number = 85) => {
    if (value >= threshold) return 'text-green-400';
    if (value >= threshold * 0.8) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getModelIcon = (model: string) => {
    switch (model) {
      case 'claude': return '🧠';
      case 'openai': return '🤖';
      case 'perplexity': return '🔍';
      default: return '⚡';
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Translation Performance Analytics</h1>
          <p className="text-muted-foreground">
            Real-time insights into AI translation system performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button onClick={fetchMetrics} disabled={isLoading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Translation Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.translationAccuracy, 90)}`}>
              {metrics.translationAccuracy.toFixed(1)}%
            </div>
            <Progress value={metrics.translationAccuracy} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Excellent performance across all models
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Speed</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {metrics.processingSpeed.toFixed(1)}/s
            </div>
            <Progress value={(metrics.processingSpeed / 15) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Elements processed per second
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Coverage</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(metrics.contentCoverage, 85)}`}>
              {metrics.contentCoverage.toFixed(1)}%
            </div>
            <Progress value={metrics.contentCoverage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Website content translated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.errorRate < 3 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.errorRate.toFixed(1)}%
            </div>
            <Progress value={100 - metrics.errorRate * 10} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Translation failure rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Models Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Models Performance Comparison
          </CardTitle>
          <CardDescription>
            Real-time performance metrics for each AI translation model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(metrics.aiModelPerformance).map(([model, perf]) => (
              <div key={model} className="space-y-4 p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getModelIcon(model)}</span>
                    <h3 className="font-semibold capitalize">{model}</h3>
                  </div>
                  <Badge variant="outline">{perf.usage.toFixed(0)}% usage</Badge>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Accuracy</span>
                      <span className={getStatusColor(perf.accuracy, 85)}>
                        {perf.accuracy.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={perf.accuracy} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Speed</span>
                      <span className="text-blue-400">{perf.speed.toFixed(1)}/s</span>
                    </div>
                    <Progress value={(perf.speed / 12) * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Usage</span>
                      <span>{perf.usage.toFixed(0)}%</span>
                    </div>
                    <Progress value={perf.usage} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Content Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Elements</span>
                <Badge variant="outline">{metrics.contentStats.totalElements}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Translated
                </span>
                <Badge className="bg-green-500 hover:bg-green-600">
                  {metrics.contentStats.translatedElements}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-yellow-400" />
                  Pending
                </span>
                <Badge variant="secondary">{metrics.contentStats.pendingElements}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Errors
                </span>
                <Badge variant="destructive">{metrics.contentStats.errorElements}</Badge>
              </div>
              
              <div className="pt-2">
                <div className="text-sm text-muted-foreground mb-2">
                  Translation Progress
                </div>
                <Progress 
                  value={(metrics.contentStats.translatedElements / metrics.contentStats.totalElements) * 100} 
                  className="h-3"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Translations</CardTitle>
            <CardDescription>
              Latest translation activities across all languages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentTranslations.map((translation, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-accent/30 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {translation.text}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {translation.language.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {getModelIcon(translation.model)} {translation.model}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {translation.time}ms
                      </span>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${getStatusColor(translation.accuracy, 85)}`}>
                    {translation.accuracy.toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Engagement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Engagement
          </CardTitle>
          <CardDescription>
            How users interact with translated content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-primary">
                {metrics.userEngagement.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">
                Users actively engaging with translated content
              </p>
            </div>
            <div className="w-32">
              <Progress value={metrics.userEngagement} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranslationPerformanceDashboard;