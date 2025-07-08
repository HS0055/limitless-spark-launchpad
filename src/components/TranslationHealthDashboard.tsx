import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, Zap, Play } from 'lucide-react';

interface TranslationStats {
  pending: number;
  completed: number;
  failed: number;
  total_languages: number;
  recent_translations: Array<{
    target_language: string;
    original_text: string;
    translated_text: string;
    created_at: string;
    status: string;
  }>;
}

export const TranslationHealthDashboard = () => {
  const [stats, setStats] = useState<TranslationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Get queue stats
      const { data: queueStats } = await supabase
        .from('translation_queue')
        .select('status, target_language, original_text, created_at');

      // Get website translations stats  
      const { data: translationStats } = await supabase
        .from('website_translations')
        .select('target_language, original_text, translated_text, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (queueStats && translationStats) {
        const pending = queueStats.filter(item => item.status === 'pending').length;
        const completed = queueStats.filter(item => item.status === 'completed').length;
        const failed = queueStats.filter(item => item.status === 'failed').length;
        const languages = new Set(translationStats.map(item => item.target_language));

        setStats({
          pending,
          completed,
          failed,
          total_languages: languages.size,
          recent_translations: translationStats.map(item => ({
            target_language: item.target_language,
            original_text: item.original_text,
            translated_text: item.translated_text,
            created_at: item.created_at,
            status: 'completed'
          }))
        });
      }
    } catch (error) {
      console.error('Failed to fetch translation stats:', error);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  const triggerAutoTranslate = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('auto-translate-system', {
        body: { mode: 'continuous-monitor', maxTextsPerBatch: 20 }
      });
      
      if (error) {
        console.error('Failed to trigger auto-translate:', error);
      } else {
        console.log('Auto-translate triggered:', data);
        setTimeout(fetchStats, 2000); // Refresh after 2 seconds
      }
    } catch (error) {
      console.error('Auto-translate error:', error);
    }
  };

  const runBatchTranslation = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('run-batch-translation');
      
      if (error) {
        console.error('Failed to run batch translation:', error);
        return;
      }
      
      if (data?.success) {
        console.log('✅ Batch translation result:', data);
        if (data.processed > 0) {
          console.log(`🎉 Processed ${data.processed} translations`);
        } else {
          console.log('📭 Translation queue is empty');
        }
        setTimeout(fetchStats, 2000); // Refresh after 2 seconds
      } else {
        console.error('❌ Batch translation failed:', data?.error);
      }
    } catch (error) {
      console.error('❌ Batch translation error:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading translation health data...</span>
        </div>
      </div>
    );
  }

  const getStatusColor = (count: number, type: 'pending' | 'failed') => {
    if (type === 'pending') return count > 10 ? 'destructive' : count > 0 ? 'secondary' : 'default';
    if (type === 'failed') return count > 0 ? 'destructive' : 'default';
    return 'default';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Translation Health Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your multi-language translation system
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button onClick={fetchStats} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={runBatchTranslation} variant="default" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Запустить пакет
          </Button>
          <Button onClick={triggerAutoTranslate} variant="outline" size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Process Queue
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Translations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stats?.pending || 0}</div>
              <Badge variant={getStatusColor(stats?.pending || 0, 'pending')}>
                {stats?.pending === 0 ? 'All clear' : 'In queue'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.completed || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-red-600">{stats?.failed || 0}</div>
              <Badge variant={getStatusColor(stats?.failed || 0, 'failed')}>
                {stats?.failed === 0 ? 'No errors' : 'Needs attention'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Languages</CardTitle>
            <span className="h-4 w-4 text-muted-foreground">🌍</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_languages || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Translations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Translations</CardTitle>
          <CardDescription>
            Latest 10 translations processed by the AI system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.recent_translations?.map((translation, index) => (
              <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{translation.target_language.toUpperCase()}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(translation.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="font-medium truncate">{translation.original_text}</div>
                    <div className="text-muted-foreground truncate">{translation.translated_text}</div>
                  </div>
                </div>
                <Badge variant="default" className="ml-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {translation.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Overall translation system status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Translation Queue</span>
              <Badge variant={stats?.pending === 0 ? 'default' : 'secondary'}>
                {stats?.pending === 0 ? '✅ Empty' : `⏳ ${stats?.pending} pending`}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Error Rate</span>
              <Badge variant={stats?.failed === 0 ? 'default' : 'destructive'}>
                {stats?.failed === 0 ? '✅ No errors' : `❌ ${stats?.failed} failed`}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Edge Functions</span>
              <Badge variant="default">✅ Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Language Coverage</span>
              <Badge variant="default">🌍 {stats?.total_languages} languages</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};