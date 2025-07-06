import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, TrendingUp } from "lucide-react";

const InteractiveCompounding = () => {
  const [principal, setPrincipal] = useState(1);
  const [days, setDays] = useState([30]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  const [mode, setMode] = useState<'simple' | 'compound'>('simple');

  const calculateValue = (day: number, isCompound: boolean = false) => {
    if (isCompound) {
      return principal * Math.pow(2, day);
    } else {
      return principal + (principal * day);
    }
  };

  const finalSimpleValue = calculateValue(days[0], false);
  const finalCompoundValue = calculateValue(days[0], true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnimating && currentDay < days[0]) {
      interval = setInterval(() => {
        setCurrentDay(prev => {
          if (prev >= days[0] - 1) {
            setIsAnimating(false);
            return days[0];
          }
          return prev + 1;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isAnimating, currentDay, days]);

  const reset = () => {
    setCurrentDay(0);
    setIsAnimating(false);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          The <span className="text-primary">Lemon Stand</span> Compounding Magic
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover why Einstein called compound interest "the eighth wonder of the world" through our interactive lemon stand example.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Controls */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🍋 Lemon Stand Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Starting Capital: ${principal}
              </label>
              <Input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value) || 1)}
                min="1"
                max="10"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Buy lemons for 50¢, sell for $1 each
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Days to Simulate: {days[0]}
              </label>
              <Slider
                value={days}
                onValueChange={setDays}
                max={31}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setMode('simple')}
                variant={mode === 'simple' ? 'default' : 'outline'}
                size="sm"
              >
                Simple Growth
              </Button>
              <Button
                onClick={() => setMode('compound')}
                variant={mode === 'compound' ? 'default' : 'outline'}
                size="sm"
              >
                Compound Growth
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setIsAnimating(!isAnimating)}
                disabled={currentDay >= days[0]}
                className="flex-1"
              >
                {isAnimating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isAnimating ? 'Pause' : 'Start'}
              </Button>
              <Button onClick={reset} variant="outline">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Visualization */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Growth Visualization</span>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Day {currentDay}</div>
                <div className="text-xl font-bold text-primary">
                  {formatCurrency(calculateValue(currentDay, mode === 'compound'))}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 relative bg-muted/20 rounded-lg p-4 overflow-hidden">
              <div className="absolute inset-4">
                {/* Grid lines */}
                <div className="absolute inset-0 opacity-20">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-full h-px bg-border"
                      style={{ top: `${(i * 100) / 4}%` }}
                    />
                  ))}
                </div>
                
                {/* Growth bars */}
                <div className="flex items-end justify-center h-full gap-1">
                  {Array.from({ length: Math.min(currentDay + 1, 20) }).map((_, i) => {
                    const value = calculateValue(i, mode === 'compound');
                    const maxValue = calculateValue(days[0], mode === 'compound');
                    const height = Math.min((value / maxValue) * 100, 100);
                    
                    return (
                      <div
                        key={i}
                        className="bg-primary opacity-80 transition-all duration-300 min-w-[8px] rounded-t"
                        style={{ 
                          height: `${height}%`,
                          animation: `scale-in 0.3s ease-out ${i * 50}ms both`
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison */}
      <Card className="bg-card border-border">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Simple Growth</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use only the initial principal each day
              </p>
              <div className="text-3xl font-bold text-muted-foreground">
                {formatCurrency(finalSimpleValue)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                After {days[0]} days
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2 text-primary">Compound Growth</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Reinvest all profits daily
              </p>
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(finalCompoundValue)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                After {days[0]} days
              </p>
            </div>
          </div>
          
          {finalCompoundValue > finalSimpleValue && (
            <div className="text-center mt-6 p-4 bg-primary/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm">
                <span className="font-semibold text-primary">
                  {((finalCompoundValue / finalSimpleValue - 1) * 100).toFixed(0)}% more profit
                </span> with compound growth!
              </p>
            </div>
          )}
          
          <div className="text-center mt-6">
            <blockquote className="text-lg italic text-muted-foreground">
              "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it."
            </blockquote>
            <cite className="text-sm text-primary mt-2 block">— Albert Einstein</cite>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default InteractiveCompounding;