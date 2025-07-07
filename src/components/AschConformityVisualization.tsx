import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight, Brain, Play, Pause } from 'lucide-react';

const AschConformityVisualization = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = [
    {
      title: "Individual Thinking",
      description: "People form their own opinions and beliefs independently",
      highlight: [4, 7, 11, 14] // Individual standouts
    },
    {
      title: "Group Pressure Emerges",
      description: "Majority begins to influence individual decisions",
      highlight: [0, 1, 2, 3, 5, 6, 8, 9, 10, 12, 13, 15] // Majority
    },
    {
      title: "Conformity Takes Hold",
      description: "Individuals change their stance to fit the group",
      highlight: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] // Almost all conform
    },
    {
      title: "The Lone Dissenter",
      description: "Only the strongest maintain their original position",
      highlight: [15] // Last holdout
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % steps.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  const PersonIcon = ({ index, isHighlighted, isLoneStandout }: { 
    index: number; 
    isHighlighted: boolean; 
    isLoneStandout?: boolean;
  }) => (
    <div className={`
      transition-all duration-500 transform hover:scale-110
      ${isHighlighted 
        ? isLoneStandout 
          ? 'text-accent-tertiary scale-110' 
          : 'text-primary scale-105' 
        : 'text-muted-foreground opacity-60'
      }
    `}>
      <Users className="w-8 h-8" />
    </div>
  );

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent-secondary/10 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Asch Conformity in Action</CardTitle>
              <p className="text-sm text-muted-foreground">How group pressure shapes individual behavior</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="hover-glow"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Visualization */}
        <div className="bg-gradient-to-br from-muted/30 to-background rounded-2xl p-8">
          <div className="grid grid-cols-4 gap-6 max-w-xs mx-auto">
            {Array.from({ length: 16 }, (_, i) => (
              <PersonIcon
                key={i}
                index={i}
                isHighlighted={steps[currentStep].highlight.includes(i)}
                isLoneStandout={currentStep === 3 && i === 15}
              />
            ))}
          </div>
          
          <div className="flex justify-center mt-6">
            <ArrowRight className="w-6 h-6 text-primary animate-pulse" />
          </div>
        </div>

        {/* Step Description */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gradient">
            {steps[currentStep].title}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Manual Controls */}
        <div className="flex justify-center gap-2">
          {steps.map((step, index) => (
            <Button
              key={index}
              variant={index === currentStep ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentStep(index)}
              className="w-3 h-3 p-0 rounded-full"
            />
          ))}
        </div>

        {/* Explanation */}
        <div className="bg-card/50 rounded-xl p-6 border border-border/50">
          <h4 className="font-semibold mb-3 text-gradient-secondary">Why This Matters</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Normative Influence:</strong> We conform to avoid looking foolish or standing out negatively.
            </p>
            <p>
              <strong>Informational Influence:</strong> We assume the group knows better and follow their lead.
            </p>
            <p className="text-accent-tertiary font-medium">
              Understanding this bias helps us make more independent, thoughtful decisions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AschConformityVisualization;