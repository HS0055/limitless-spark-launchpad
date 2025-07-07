import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Zap, Target, AlertTriangle, CheckCircle, Cpu } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface TranslationMetrics {
  isActive: boolean;
  isProcessing: boolean;
  totalElements: number;
  processedElements: number;
  errorCount: number;
  accuracy: number;
  speed: number;
  coverage: number;
  errorRate: number;
  modelsUsed: string[];
  lastError?: string;
}

const TranslationMetricsDisplay = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<TranslationMetrics>({
    isActive: false,
    isProcessing: false,
    totalElements: 0,
    processedElements: 0,
    errorCount: 0,
    accuracy: 0,
    speed: 0,
    coverage: 0,
    errorRate: 0,
    modelsUsed: []
  });
  const [isVisible, setIsVisible] = useState(false);

  // Only show for admin users
  useEffect(() => {
    // This would be connected to the actual translation engine metrics
    // For now, we'll simulate some metrics
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        // Simulate realistic metrics
        accuracy: Math.min(100, prev.accuracy + Math.random() * 2),
        speed: Math.random() * 10 + 5,
        coverage: Math.min(100, prev.coverage + Math.random() * 5),
        errorRate: Math.max(0, Math.random() * 3),
        modelsUsed: ['Claude', 'OpenAI', 'Perplexity']
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Show/hide based on keyboard shortcut (Ctrl+Shift+T)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'T') {
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible || !user) return null;

  const getStatusColor = (value: number, threshold: number = 80) => {
    if (value >= threshold) return 'text-green-400';
    if (value >= threshold * 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusBadge = () => {
    if (!metrics.isActive) return <Badge variant="secondary">Inactive</Badge>;
    if (metrics.isProcessing) return <Badge className="bg-blue-500 animate-pulse">Processing</Badge>;
    return <Badge className="bg-green-500">Active</Badge>;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-background/95 backdrop-blur-md border-border/50 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">AI Translation Engine</CardTitle>
            </div>
            {getStatusBadge()}
          </div>
          <CardDescription className="text-xs">
            Real-time translation system metrics
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Processing Progress */}
          {metrics.totalElements > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing Progress</span>
                <span>{metrics.processedElements}/{metrics.totalElements}</span>
              </div>
              <Progress 
                value={(metrics.processedElements / metrics.totalElements) * 100} 
                className="h-2"
              />
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span className="text-xs font-medium">Accuracy</span>
              </div>
              <div className={`text-lg font-bold ${getStatusColor(metrics.accuracy)}`}>
                {metrics.accuracy.toFixed(1)}%
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span className="text-xs font-medium">Speed</span>
              </div>
              <div className="text-lg font-bold text-blue-400">
                {metrics.speed.toFixed(1)}/s
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span className="text-xs font-medium">Coverage</span>
              </div>
              <div className={`text-lg font-bold ${getStatusColor(metrics.coverage)}`}>
                {metrics.coverage.toFixed(1)}%
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs font-medium">Error Rate</span>
              </div>
              <div className={`text-lg font-bold ${metrics.errorRate < 5 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.errorRate.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* AI Models Used */}
          {metrics.modelsUsed.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                <span className="text-xs font-medium">AI Models Active</span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {metrics.modelsUsed.map((model) => (
                  <Badge key={model} variant="outline" className="text-xs px-1 py-0">
                    {model}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {metrics.lastError && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-red-400">Last Error</span>
              <div className="text-xs text-muted-foreground bg-red-500/10 p-2 rounded border border-red-500/20">
                {metrics.lastError}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="text-center text-xs text-muted-foreground border-t pt-2">
            Press Ctrl+Shift+T to toggle • Admin only
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranslationMetricsDisplay;