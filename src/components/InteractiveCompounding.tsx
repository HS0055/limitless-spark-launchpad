import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, TrendingUp } from "lucide-react";
import compoundDiagram from "@/assets/compound-interest-diagram.jpg";
import growthChart from "@/assets/growth-chart-visual.jpg";
import lemonFlow from "@/assets/lemon-business-flow.jpg";

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
        <div className="inline-flex items-center bg-primary/10 rounded-full px-4 py-2 mb-6">
          <span className="text-sm font-medium text-primary">1.3 - Setting Lemons</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          The <span className="text-primary">Lemon Stand</span> Compounding Magic
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
          Let's see a market example to judge if compounding is truly magical.
        </p>
        
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-6">An Example:</h3>
            <div className="space-y-4 text-lg leading-relaxed">
              <p><strong>Imagine we have $1 of principal.</strong></p>
              <p>With that $1, we buy two lemons for 50¢ each.</p>
              <p>We go to the market and sell those two lemons for $1 each. Now we have $2.</p>
            </div>
            
            {/* Visual diagram */}
            <div className="mt-8 bg-background rounded-xl p-6">
              <div className="grid grid-cols-3 gap-8 items-center text-center">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">Starting value</h4>
                  <div className="w-20 h-20 mx-auto border-2 border-foreground rounded-lg flex items-center justify-center text-xl font-bold">
                    $1
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">Buy for</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold">
                        🍋 50¢
                      </div>
                      <span className="text-2xl">→</span>
                      <div className="w-16 h-12 border-2 border-primary rounded-lg flex items-center justify-center text-sm font-bold text-primary">
                        $1
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold">
                        🍋 50¢
                      </div>
                      <span className="text-2xl">→</span>
                      <div className="w-16 h-12 border-2 border-primary rounded-lg flex items-center justify-center text-sm font-bold text-primary">
                        $1
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">Sell for</h4>
                  <div className="w-20 h-20 mx-auto border-2 border-primary rounded-lg flex items-center justify-center text-xl font-bold text-primary">
                    $2
                  </div>
                  <p className="text-sm text-primary font-medium mt-2">Ending Value</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Educational Images Gallery */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border overflow-hidden hover:border-primary/20 transition-colors">
            <div className="relative h-40">
              <img 
                src={lemonFlow} 
                alt="Lemon Business Flow" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <h4 className="text-sm font-semibold text-foreground">Buy & Sell Process</h4>
              </div>
            </div>
          </Card>
          
          <Card className="bg-card border-border overflow-hidden hover:border-primary/20 transition-colors">
            <div className="relative h-40">
              <img 
                src={compoundDiagram} 
                alt="Compound Interest Diagram" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <h4 className="text-sm font-semibold text-foreground">Compounding Effect</h4>
              </div>
            </div>
          </Card>
          
          <Card className="bg-card border-border overflow-hidden hover:border-primary/20 transition-colors">
            <div className="relative h-40">
              <img 
                src={growthChart} 
                alt="Growth Chart" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <h4 className="text-sm font-semibold text-foreground">Exponential Growth</h4>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Simple Growth Explanation */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-lg leading-relaxed mb-6">
                We started with $1 of principal (the initial invested amount). With this 
                principal amount, we generated $1 of interest. That is 100% of the 
                principal amount; meaning we generated a 100% return. We doubled 
                the amount of the principal! Nice.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                Imagine we do this for 30 days without using ANY of our generated 
                interest for the month.
              </p>
              <p className="text-lg leading-relaxed">
                This means we start every day with <strong>only</strong> the initial principal (the $1).
              </p>
              <p className="text-lg leading-relaxed mt-4">
                Our <em>cumulative</em> growth over time would look like this:
              </p>
            </div>
            <div className="bg-background rounded-xl p-6">
              <h4 className="text-center font-semibold mb-4">Simple Growth</h4>
              <div className="h-48 bg-black rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-4 left-4 text-yellow-400 text-2xl">🍋</div>
                <div className="absolute top-4 right-4 text-green-400 text-sm font-bold">$31</div>
                <div className="absolute bottom-4 left-4 text-white text-xs">$1</div>
                <div className="absolute bottom-4 right-4 text-white text-xs">31</div>
                
                {/* Simple growth visualization */}
                <div className="absolute inset-0 flex items-end justify-center p-4">
                  <div className="w-full h-2/3 relative">
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-400"></div>
                    {Array.from({ length: 31 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute bottom-0 bg-green-400 w-1"
                        style={{
                          left: `${(i / 30) * 100}%`,
                          height: `${((i + 1) / 31) * 100}%`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                At the end of the month we would have a total of $31 dollars.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Compound Growth Explanation */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
          <p className="text-lg leading-relaxed text-center mb-8">
            Now, what if we were able to use the generated interest to buy more lemons for the next day? What if we <strong>compound</strong> the 
            generated interest by making it part of the principal and therefore using it to buy more lemons) for the following day?
          </p>
          <p className="text-center text-lg font-medium mb-8">
            A few days going to market would look like this:
          </p>
          
          {/* Compound Growth Visual */}
          <div className="bg-background rounded-xl p-6 mb-8">
            <h4 className="text-center font-semibold mb-6">Compound Growth</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-muted-foreground mb-2">Day 0</div>
                <div className="w-16 h-12 mx-auto border-2 border-foreground rounded-lg flex items-center justify-center font-bold">
                  $1
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground mb-2">Day 1</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <div className="text-xs">Buy</div>
                    <div className="w-12 h-8 bg-yellow-400 rounded flex items-center justify-center text-xs">50¢</div>
                    <div className="text-xs">Sell</div>
                    <div className="w-12 h-8 border border-primary rounded flex items-center justify-center text-xs text-primary">$1</div>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <div className="text-xs">Buy</div>
                    <div className="w-12 h-8 bg-yellow-400 rounded flex items-center justify-center text-xs">50¢</div>
                    <div className="text-xs">Sell</div>
                    <div className="w-12 h-8 border border-primary rounded flex items-center justify-center text-xs text-primary">$1</div>
                  </div>
                </div>
                <div className="text-primary font-bold mt-2">Accumulated Value $2</div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground mb-2">Day 2</div>
                <div className="space-y-1">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex flex-col items-center">
                      <div className="text-xs">Buy</div>
                      <div className="w-10 h-6 bg-yellow-400 rounded text-xs flex items-center justify-center">50¢</div>
                      <div className="text-xs">Sell</div>
                      <div className="w-10 h-6 border border-primary rounded text-xs flex items-center justify-center text-primary">$1</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-xs">Buy</div>
                      <div className="w-10 h-6 bg-yellow-400 rounded text-xs flex items-center justify-center">50¢</div>
                      <div className="text-xs">Sell</div>
                      <div className="w-10 h-6 border border-primary rounded text-xs flex items-center justify-center text-primary">$1</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex flex-col items-center">
                      <div className="text-xs">Buy</div>
                      <div className="w-10 h-6 bg-yellow-400 rounded text-xs flex items-center justify-center">50¢</div>
                      <div className="text-xs">Sell</div>
                      <div className="w-10 h-6 border border-primary rounded text-xs flex items-center justify-center text-primary">$1</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-xs">Buy</div>
                      <div className="w-10 h-6 bg-yellow-400 rounded text-xs flex items-center justify-center">50¢</div>
                      <div className="text-xs">Sell</div>
                      <div className="w-10 h-6 border border-primary rounded text-xs flex items-center justify-center text-primary">$1</div>
                    </div>
                  </div>
                </div>
                <div className="text-primary font-bold mt-2">Accumulated Value $4</div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-4">$1,073,741,824</div>
            <p className="text-lg mb-4">
              By the end of the month (in an unlimited market) we would have:
            </p>
            <p className="text-lg font-medium mb-8">
              That my friends, is the magic of compounding.
            </p>
            
            {/* Compound growth chart */}
            <div className="bg-background rounded-xl p-6">
              <h4 className="text-center font-semibold mb-4">Compound Growth</h4>
              <div className="h-48 bg-black rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-4 left-4 text-yellow-400 text-2xl">🍋</div>
                <div className="absolute top-4 right-4 text-green-400 text-sm font-bold">$1,073,741,824</div>
                <div className="absolute bottom-4 left-4 text-white text-xs">$1</div>
                <div className="absolute bottom-4 right-4 text-white text-xs">30</div>
                
                {/* Exponential curve */}
                <div className="absolute inset-0 flex items-end justify-end p-4">
                  <div className="w-full h-full relative">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path
                        d="M 0 100 Q 50 95 100 0"
                        stroke="rgb(34, 197, 94)"
                        strokeWidth="2"
                        fill="none"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-12">
        <blockquote className="text-2xl font-display italic text-foreground mb-4">
          This is why Albert Einstein said: "Compound interest is the eighth wonder of the world."
        </blockquote>
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