import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/Icon';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

const PythonCompute = () => {
  const [operation, setOperation] = useState('');
  const [inputData, setInputData] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const operations = {
    statistics: {
      name: 'Statistical Analysis',
      description: 'Calculate mean, median, standard deviation, etc.',
      icon: 'BarChart3' as const,
      example: '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]'
    },
    linearRegression: {
      name: 'Linear Regression',
      description: 'Find best fit line for data points',
      icon: 'TrendingUp' as const,
      example: '{"xData": [1, 2, 3, 4, 5], "yData": [2, 4, 6, 8, 10]}'
    },
    correlationCoefficient: {
      name: 'Correlation Analysis',
      description: 'Calculate correlation between two datasets',
      icon: 'Calculator' as const,
      example: '{"xData": [1, 2, 3, 4, 5], "yData": [2, 4, 6, 8, 10]}'
    },
    movingAverage: {
      name: 'Moving Average',
      description: 'Smooth time series data',
      icon: 'TrendingUp' as const,
      example: '{"data": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], "windowSize": 3}'
    },
    compoundInterest: {
      name: 'Compound Interest',
      description: 'Calculate investment growth',
      icon: 'Calculator' as const,
      example: '{"principal": 1000, "rate": 0.05, "time": 10, "frequency": 12}'
    },
    textAnalysis: {
      name: 'Text Analysis',
      description: 'Analyze text content and statistics',
      icon: 'BarChart3' as const,
      example: '"This is a sample text for analysis. It contains multiple sentences and words for testing."'
    }
  };

  const handleCompute = async () => {
    if (!operation || !inputData.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select an operation and provide input data",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      let parsedData;
      try {
        parsedData = JSON.parse(inputData);
      } catch {
        // If JSON parsing fails, treat as string
        parsedData = inputData;
      }

      const response = await apiClient.invoke('python-compute', {
        body: {
          operation,
          data: parsedData
        }
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setResult(response.data);
      toast({
        title: "Computation Complete",
        description: `Operation completed in ${response.data.executionTime}`,
      });

    } catch (error) {
      console.error('Computation error:', error);
      toast({
        title: "Computation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Calculator" className="h-5 w-5" />
            Computation Result
          </CardTitle>
          <CardDescription>
            Operation: {result.operation} • Execution time: {result.executionTime}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {typeof result.result === 'object' ? (
              <div className="grid gap-2">
                {Object.entries(result.result).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-secondary/50 rounded">
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <Badge variant="outline">
                      {Array.isArray(value) ? `Array[${value.length}]` : String(value)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-secondary/50 rounded font-mono">
                {String(result.result)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Calculator" className="h-6 w-6" />
            Python-like Computation Engine
          </CardTitle>
          <CardDescription>
            Perform complex calculations and data analysis with instant results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="operation">Select Operation</Label>
            <Select value={operation} onValueChange={setOperation}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a computation operation" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(operations).map(([key, op]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Icon name={op.icon} className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{op.name}</div>
                        <div className="text-xs text-muted-foreground">{op.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {operation && (
            <div>
              <Label htmlFor="inputData">Input Data</Label>
              <Textarea
                id="inputData"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder={`Example: ${operations[operation as keyof typeof operations]?.example}`}
                rows={6}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {operations[operation as keyof typeof operations]?.description}
              </p>
            </div>
          )}

          <Button 
            onClick={handleCompute} 
            disabled={isLoading || !operation || !inputData.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                Computing...
              </>
            ) : (
              <>
                <Icon name="Calculator" className="mr-2 h-4 w-4" />
                Execute Computation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {renderResult()}
    </div>
  );
};

export default PythonCompute;