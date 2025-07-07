import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bug, 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  Target, 
  BarChart3, 
  Settings, 
  RefreshCw,
  Edit3,
  Save,
  X
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

interface TranslationBug {
  id: string;
  type: 'missing_icon' | 'broken_layout' | 'untranslated_text' | 'invalid_translation';
  element: string;
  originalContent: string;
  translatedContent?: string;
  timestamp: number;
  resolved: boolean;
}

interface SystemMetrics {
  totalTranslations: number;
  successRate: number;
  bugsDetected: number;
  bugsFixed: number;
  elementsDetected: number;
  iconsRestored: number;
  averageTranslationTime: number;
}

interface ManualOverride {
  id: string;
  originalText: string;
  correctedTranslation: string;
  language: string;
  context: string;
  timestamp: number;
}

const IntelligentTranslationDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [hasAdminRole, setHasAdminRole] = useState(false);
  
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalTranslations: 0,
    successRate: 100,
    bugsDetected: 0,
    bugsFixed: 0,
    elementsDetected: 0,
    iconsRestored: 0,
    averageTranslationTime: 0
  });
  
  const [bugs, setBugs] = useState<TranslationBug[]>([]);
  const [overrides, setOverrides] = useState<ManualOverride[]>([]);
  const [selectedBug, setSelectedBug] = useState<TranslationBug | null>(null);
  const [editingOverride, setEditingOverride] = useState<string>('');
  const [newOverrideText, setNewOverrideText] = useState('');

  // Check admin role and initialize
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) return;
      
      try {
        const { data } = await apiClient.invoke('check-admin-role');
        setHasAdminRole(data?.isAdmin || false);
      } catch (error) {
        setHasAdminRole(false);
      }
    };

    checkAdminRole();
    
    // Load initial data
    loadMetrics();
    loadBugs();
    loadOverrides();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadMetrics();
      loadBugs();
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  // Keyboard shortcut to show/hide dashboard (Ctrl+Shift+T)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'T' && hasAdminRole) {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasAdminRole]);

  const loadMetrics = async () => {
    try {
      // In a real implementation, this would fetch from your backend
      // For now, we'll use simulated data
      const simulatedMetrics: SystemMetrics = {
        totalTranslations: Math.floor(Math.random() * 1000) + 500,
        successRate: 95 + Math.floor(Math.random() * 5),
        bugsDetected: Math.floor(Math.random() * 20) + 5,
        bugsFixed: Math.floor(Math.random() * 15) + 3,
        elementsDetected: Math.floor(Math.random() * 200) + 100,
        iconsRestored: Math.floor(Math.random() * 10) + 2,
        averageTranslationTime: 150 + Math.floor(Math.random() * 100)
      };
      
      setMetrics(simulatedMetrics);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const loadBugs = async () => {
    try {
      // Simulated bug data - in real implementation, fetch from your backend
      const simulatedBugs: TranslationBug[] = [
        {
          id: 'bug_1',
          type: 'missing_icon',
          element: 'button',
          originalContent: '<button><i class="fa fa-home"></i> Home</button>',
          timestamp: Date.now() - 300000,
          resolved: false
        },
        {
          id: 'bug_2',
          type: 'untranslated_text',
          element: 'h1',
          originalContent: 'Welcome to TopOne Academy',
          timestamp: Date.now() - 600000,
          resolved: true
        },
        {
          id: 'bug_3',
          type: 'invalid_translation',
          element: 'p',
          originalContent: 'Learn business fundamentals',
          translatedContent: 'Learn business fundamentals', // Same text = invalid
          timestamp: Date.now() - 900000,
          resolved: false
        }
      ];
      
      setBugs(simulatedBugs);
    } catch (error) {
      console.error('Failed to load bugs:', error);
    }
  };

  const loadOverrides = async () => {
    try {
      // Load manual overrides from localStorage or backend
      const saved = localStorage.getItem('translation-overrides');
      if (saved) {
        setOverrides(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load overrides:', error);
    }
  };

  const handleManualFix = async (bugId: string) => {
    try {
      // Apply manual fix
      const result = await apiClient.invoke('ai-translate', {
        body: {
          action: 'manual_fix',
          bugId,
          adminId: user?.id
        }
      });

      if (result.success) {
        setBugs(prev => prev.map(bug => 
          bug.id === bugId ? { ...bug, resolved: true } : bug
        ));
        
        toast({
          title: "Bug Fixed",
          description: "Manual fix applied successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Fix Failed",
        description: "Could not apply manual fix",
        variant: "destructive"
      });
    }
  };

  const handleOverrideTranslation = async (originalText: string, newTranslation: string) => {
    try {
      const override: ManualOverride = {
        id: `override_${Date.now()}`,
        originalText,
        correctedTranslation: newTranslation,
        language: 'current', // You'd get this from language context
        context: 'manual_correction',
        timestamp: Date.now()
      };

      const updatedOverrides = [...overrides, override];
      setOverrides(updatedOverrides);
      localStorage.setItem('translation-overrides', JSON.stringify(updatedOverrides));

      // Apply the override immediately
      const elements = document.querySelectorAll('*');
      elements.forEach(element => {
        if (element.textContent === originalText) {
          element.textContent = newTranslation;
          element.setAttribute('data-manual-override', 'true');
        }
      });

      setEditingOverride('');
      setNewOverrideText('');
      
      toast({
        title: "Override Applied",
        description: "Translation override saved and applied",
      });
    } catch (error) {
      toast({
        title: "Override Failed",
        description: "Could not apply translation override",
        variant: "destructive"
      });
    }
  };

  const getBugTypeIcon = (type: TranslationBug['type']) => {
    switch (type) {
      case 'missing_icon': return <Zap className="w-4 h-4" />;
      case 'broken_layout': return <Target className="w-4 h-4" />;
      case 'untranslated_text': return <AlertTriangle className="w-4 h-4" />;
      case 'invalid_translation': return <Bug className="w-4 h-4" />;
      default: return <Bug className="w-4 h-4" />;
    }
  };

  const getBugTypeColor = (type: TranslationBug['type']) => {
    switch (type) {
      case 'missing_icon': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'broken_layout': return 'bg-red-500/10 text-red-700 border-red-200';
      case 'untranslated_text': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      case 'invalid_translation': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  if (!hasAdminRole || !isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Intelligent Translation System</h2>
            <p className="text-sm text-muted-foreground">Real-time translation monitoring & bug detection</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsVisible(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mx-6 mt-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bugs">Bug Detection</TabsTrigger>
              <TabsTrigger value="overrides">Manual Overrides</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <div className="flex-1 p-6 overflow-auto">
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Translations</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.totalTranslations.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Active session</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.successRate}%</div>
                      <p className="text-xs text-muted-foreground">Translation accuracy</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Bugs Detected</CardTitle>
                      <Bug className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.bugsDetected}</div>
                      <p className="text-xs text-muted-foreground">{metrics.bugsFixed} auto-fixed</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Elements Detected</CardTitle>
                      <Target className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.elementsDetected}</div>
                      <p className="text-xs text-muted-foreground">Website coverage</p>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    System is actively monitoring {metrics.elementsDetected} elements across the website. 
                    {metrics.iconsRestored > 0 && ` ${metrics.iconsRestored} icons have been restored automatically.`}
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="bugs" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Detected Issues</h3>
                  <Button onClick={loadBugs} size="sm" variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {bugs.map((bug) => (
                      <Card 
                        key={bug.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedBug?.id === bug.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedBug(bug)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getBugTypeIcon(bug.type)}
                              <div>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getBugTypeColor(bug.type)}>
                                    {bug.type.replace('_', ' ')}
                                  </Badge>
                                  {bug.resolved && (
                                    <Badge variant="secondary">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Resolved
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Element: {bug.element}
                                </p>
                                <p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1 max-w-md truncate">
                                  {bug.originalContent}
                                </p>
                              </div>
                            </div>
                            {!bug.resolved && (
                              <Button 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleManualFix(bug.id);
                                }}
                              >
                                Fix Now
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="overrides" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Manual Translation Overrides</h3>
                  <Button 
                    onClick={() => setEditingOverride('new')} 
                    size="sm"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    New Override
                  </Button>
                </div>

                {editingOverride === 'new' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Create New Override</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Original Text</label>
                        <Input 
                          placeholder="Enter original text to override..."
                          value={selectedBug?.originalContent || ''}
                          onChange={(e) => setSelectedBug(prev => prev ? {...prev, originalContent: e.target.value} : null)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Corrected Translation</label>
                        <Textarea 
                          placeholder="Enter correct translation..."
                          value={newOverrideText}
                          onChange={(e) => setNewOverrideText(e.target.value)}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleOverrideTranslation(
                            selectedBug?.originalContent || '', 
                            newOverrideText
                          )}
                          disabled={!newOverrideText.trim()}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Override
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setEditingOverride('');
                            setNewOverrideText('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {overrides.map((override) => (
                      <Card key={override.id}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{override.language}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(override.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Original:</p>
                              <p className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                                {override.originalText}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Override:</p>
                              <p className="text-sm font-mono bg-green-50 px-2 py-1 rounded">
                                {override.correctedTranslation}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                      <CardDescription>Real-time system performance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Average Translation Time</span>
                          <span className="text-sm font-medium">{metrics.averageTranslationTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Icons Restored</span>
                          <span className="text-sm font-medium">{metrics.iconsRestored}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Auto-fix Success Rate</span>
                          <span className="text-sm font-medium">
                            {metrics.bugsDetected > 0 ? Math.round((metrics.bugsFixed / metrics.bugsDetected) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Bug Distribution</CardTitle>
                      <CardDescription>Types of issues detected</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { type: 'missing_icon', count: bugs.filter(b => b.type === 'missing_icon').length },
                          { type: 'broken_layout', count: bugs.filter(b => b.type === 'broken_layout').length },
                          { type: 'untranslated_text', count: bugs.filter(b => b.type === 'untranslated_text').length },
                          { type: 'invalid_translation', count: bugs.filter(b => b.type === 'invalid_translation').length }
                        ].map(({ type, count }) => (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getBugTypeIcon(type as TranslationBug['type'])}
                              <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                            </div>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default IntelligentTranslationDashboard;