import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAutoTranslateSystem } from '@/hooks/useAutoTranslateSystem';
import { useToast } from '@/hooks/use-toast';
import { Bot, Globe, Zap, RefreshCw, Loader2, CheckCircle2, AlertCircle, Settings } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

const AutoTranslateControl = () => {
  const { toast } = useToast();
  const { availableLanguages } = useTranslation();
  
  const [autoConfig, setAutoConfig] = useState({
    enabled: true,
    interval: 5,
    maxTextsPerBatch: 30,
    enabledLanguages: ['fr', 'de', 'es', 'ru', 'zh', 'ja', 'ko', 'ar'],
    enableFullSiteScan: false
  });

  const autoTranslate = useAutoTranslateSystem(autoConfig);
  const [isScanning, setIsScanning] = useState(false);
  const [isFullScanning, setIsFullScanning] = useState(false);

  const handleScanCurrentPage = async () => {
    setIsScanning(true);
    try {
      await autoTranslate.scanCurrentPage();
      toast({
        title: "Page Scanned",
        description: "Current page has been scanned for missing translations",
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleFullSiteScan = async () => {
    setIsFullScanning(true);
    try {
      await autoTranslate.scanFullSite();
      toast({
        title: "Full Site Scan Complete",
        description: "All pages have been scanned and missing translations processed",
      });
    } catch (error) {
      toast({
        title: "Full Scan Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsFullScanning(false);
    }
  };

  const handleRunMonitor = async () => {
    try {
      await autoTranslate.runContinuousMonitor();
      toast({
        title: "Monitor Executed",
        description: "Translation queue has been processed",
      });
    } catch (error) {
      toast({
        title: "Monitor Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const updateConfig = (key: string, value: any) => {
    setAutoConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Bot className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Auto-Translation System</h2>
        <Badge variant={autoConfig.enabled ? "default" : "secondary"}>
          {autoConfig.enabled ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>System Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure how the auto-translation system works
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Enable Auto-Translation</label>
              <p className="text-sm text-muted-foreground">
                Automatically detect and translate missing content
              </p>
            </div>
            <Switch
              checked={autoConfig.enabled}
              onCheckedChange={(checked) => updateConfig('enabled', checked)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium">Monitor Interval (minutes)</label>
              <Select 
                value={autoConfig.interval.toString()} 
                onValueChange={(value) => updateConfig('interval', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-medium">Batch Size</label>
              <Select 
                value={autoConfig.maxTextsPerBatch.toString()} 
                onValueChange={(value) => updateConfig('maxTextsPerBatch', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 texts</SelectItem>
                  <SelectItem value="20">20 texts</SelectItem>
                  <SelectItem value="30">30 texts</SelectItem>
                  <SelectItem value="50">50 texts</SelectItem>
                  <SelectItem value="100">100 texts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Full Site Scanning</label>
              <p className="text-sm text-muted-foreground">
                Enable comprehensive site-wide translation scanning
              </p>
            </div>
            <Switch
              checked={autoConfig.enableFullSiteScan}
              onCheckedChange={(checked) => updateConfig('enableFullSiteScan', checked)}
            />
          </div>

          <div>
            <label className="font-medium">Active Languages</label>
            <p className="text-sm text-muted-foreground mb-2">
              Currently processing: {autoConfig.enabledLanguages.length} languages
            </p>
            <div className="flex flex-wrap gap-2">
              {availableLanguages
                .filter(lang => lang.code !== 'en')
                .slice(0, 8)
                .map((lang) => (
                  <Badge 
                    key={lang.code} 
                    variant={autoConfig.enabledLanguages.includes(lang.code) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const enabled = autoConfig.enabledLanguages.includes(lang.code);
                      updateConfig('enabledLanguages', enabled 
                        ? autoConfig.enabledLanguages.filter(l => l !== lang.code)
                        : [...autoConfig.enabledLanguages, lang.code]
                      );
                    }}
                  >
                    {lang.flag} {lang.name}
                  </Badge>
                ))}
              <Badge variant="outline" className="opacity-60">
                +{Math.max(0, availableLanguages.length - 9)} more...
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <span>Scan Current Page</span>
            </CardTitle>
            <CardDescription>
              Scan this page for missing translations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleScanCurrentPage} 
              disabled={isScanning || !autoConfig.enabled}
              className="w-full"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Scan Page
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-green-500" />
              <span>Full Site Scan</span>
            </CardTitle>
            <CardDescription>
              Comprehensive scan of all pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleFullSiteScan} 
              disabled={isFullScanning || !autoConfig.enabled}
              className="w-full"
              variant="outline"
            >
              {isFullScanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning Site...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Scan All Pages
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-purple-500" />
              <span>Process Queue</span>
            </CardTitle>
            <CardDescription>
              Process pending translations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleRunMonitor} 
              disabled={!autoConfig.enabled}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Monitor
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current auto-translation system status and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {autoConfig.enabled ? (
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                )}
              </div>
              <div className="text-sm font-medium">System Status</div>
              <div className="text-xs text-muted-foreground">
                {autoConfig.enabled ? 'Active' : 'Inactive'}
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{autoConfig.enabledLanguages.length}</div>
              <div className="text-sm font-medium">Active Languages</div>
              <div className="text-xs text-muted-foreground">
                Auto-translating
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{autoConfig.interval}</div>
              <div className="text-sm font-medium">Monitor Interval</div>
              <div className="text-xs text-muted-foreground">
                Minutes
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-500">{autoConfig.maxTextsPerBatch}</div>
              <div className="text-sm font-medium">Batch Size</div>
              <div className="text-xs text-muted-foreground">
                Texts per run
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="flex items-start space-x-2">
              <Bot className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="font-medium">Auto-Translation Features</div>
                <div className="text-sm text-muted-foreground space-y-1 mt-1">
                  <div>• Automatic content detection on page load</div>
                  <div>• Continuous background translation processing</div>
                  <div>• Support for 50+ languages</div>
                  <div>• Smart context-aware AI translations</div>
                  <div>• Real-time translation updates</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoTranslateControl;