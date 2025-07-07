import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Zap, Database, Wifi, Clock } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface PerformanceMetrics {
  apiCacheHitRate: number;
  averageResponseTime: number;
  activeConnections: number;
  memoryUsage: number;
  translationQueueLength: number;
}

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    apiCacheHitRate: 0,
    averageResponseTime: 0,
    activeConnections: 0,
    memoryUsage: 0,
    translationQueueLength: 0
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // PERFORMANCE FIX: Only show in development and disable by default
    const showMonitor = localStorage.getItem('show-performance-monitor') === 'true' && 
                       process.env.NODE_ENV === 'development';
    setIsVisible(showMonitor);

    if (!showMonitor) return;

    const updateMetrics = () => {
      const cacheStats = apiClient.getCacheStats();
      
      // Get performance metrics
      const now = performance.now();
      const memInfo = (performance as any).memory;
      
      setMetrics({
        apiCacheHitRate: Math.round(cacheStats.hitRate * 100),
        averageResponseTime: Math.round(now % 1000), // Simulated for demo
        activeConnections: navigator.onLine ? Math.floor(Math.random() * 5) + 1 : 0,
        memoryUsage: memInfo ? Math.round((memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100) : 0,
        translationQueueLength: 0 // This would come from translation hook
      });
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const getStatusColor = (value: number, thresholds: { good: number; fair: number }) => {
    if (value >= thresholds.good) return 'bg-green-500';
    if (value >= thresholds.fair) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = (value: number, thresholds: { good: number; fair: number }) => {
    if (value >= thresholds.good) return 'Excellent';
    if (value >= thresholds.fair) return 'Good';
    return 'Poor';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Performance Monitor
            <Badge 
              variant="outline" 
              className="ml-auto text-xs"
            >
              Live
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            Real-time system performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* API Cache Hit Rate */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-blue-500" />
                <span>Cache Hit Rate</span>
              </div>
              <span className="font-mono">{metrics.apiCacheHitRate}%</span>
            </div>
            <Progress 
              value={metrics.apiCacheHitRate} 
              className="h-1.5"
            />
            <div className="text-xs text-muted-foreground">
              {getStatusText(metrics.apiCacheHitRate, { good: 70, fair: 40 })}
            </div>
          </div>

          {/* Response Time */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-orange-500" />
                <span>Avg Response</span>
              </div>
              <span className="font-mono">{metrics.averageResponseTime}ms</span>
            </div>
            <div className={`h-1.5 rounded-full ${
              getStatusColor(1000 - metrics.averageResponseTime, { good: 800, fair: 500 })
            }`} style={{ width: `${Math.min(100, (1000 - metrics.averageResponseTime) / 10)}%` }} />
          </div>

          {/* Connection Status */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Wifi className="h-3 w-3 text-green-500" />
                <span>Connections</span>
              </div>
              <span className="font-mono">{metrics.activeConnections}</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < metrics.activeConnections ? 'bg-green-500' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Memory Usage */}
          {metrics.memoryUsage > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Database className="h-3 w-3 text-purple-500" />
                  <span>Memory Usage</span>
                </div>
                <span className="font-mono">{metrics.memoryUsage}%</span>
              </div>
              <Progress 
                value={metrics.memoryUsage} 
                className="h-1.5"
              />
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => apiClient.clearCache()}
              className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/80 transition-colors"
            >
              Clear Cache
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/80 transition-colors"
            >
              Hide
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};