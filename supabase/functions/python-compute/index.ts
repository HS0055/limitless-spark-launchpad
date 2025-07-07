import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ComputeRequest {
  operation: string;
  data: any;
  params?: Record<string, any>;
}

// Mathematical and data processing functions
const computeFunctions = {
  // Statistical analysis
  statistics: (data: number[]) => {
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / data.length;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    const sorted = [...data].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0 
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    
    return {
      count: data.length,
      sum,
      mean: parseFloat(mean.toFixed(4)),
      median,
      variance: parseFloat(variance.toFixed(4)),
      standardDeviation: parseFloat(stdDev.toFixed(4)),
      min: Math.min(...data),
      max: Math.max(...data),
      range: Math.max(...data) - Math.min(...data)
    };
  },

  // Linear regression
  linearRegression: (xData: number[], yData: number[]) => {
    const n = xData.length;
    const sumX = xData.reduce((a, b) => a + b, 0);
    const sumY = yData.reduce((a, b) => a + b, 0);
    const sumXY = xData.reduce((sum, x, i) => sum + x * yData[i], 0);
    const sumXX = xData.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const yMean = sumY / n;
    const totalSumSquares = yData.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const residualSumSquares = yData.reduce((sum, y, i) => {
      const predicted = slope * xData[i] + intercept;
      return sum + Math.pow(y - predicted, 2);
    }, 0);
    const rSquared = 1 - (residualSumSquares / totalSumSquares);
    
    return {
      slope: parseFloat(slope.toFixed(6)),
      intercept: parseFloat(intercept.toFixed(6)),
      rSquared: parseFloat(rSquared.toFixed(6)),
      equation: `y = ${slope.toFixed(6)}x + ${intercept.toFixed(6)}`
    };
  },

  // Matrix operations
  matrixMultiply: (matrixA: number[][], matrixB: number[][]) => {
    const result = [];
    for (let i = 0; i < matrixA.length; i++) {
      result[i] = [];
      for (let j = 0; j < matrixB[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < matrixB.length; k++) {
          sum += matrixA[i][k] * matrixB[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  },

  // Data analysis
  correlationCoefficient: (xData: number[], yData: number[]) => {
    const n = xData.length;
    const sumX = xData.reduce((a, b) => a + b, 0);
    const sumY = yData.reduce((a, b) => a + b, 0);
    const sumXY = xData.reduce((sum, x, i) => sum + x * yData[i], 0);
    const sumXX = xData.reduce((sum, x) => sum + x * x, 0);
    const sumYY = yData.reduce((sum, y) => sum + y * y, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return parseFloat((numerator / denominator).toFixed(6));
  },

  // Time series analysis
  movingAverage: (data: number[], windowSize: number) => {
    const result = [];
    for (let i = 0; i <= data.length - windowSize; i++) {
      const window = data.slice(i, i + windowSize);
      const average = window.reduce((a, b) => a + b, 0) / windowSize;
      result.push(parseFloat(average.toFixed(4)));
    }
    return result;
  },

  // Financial calculations
  compoundInterest: (principal: number, rate: number, time: number, frequency: number = 1) => {
    const amount = principal * Math.pow(1 + rate / frequency, frequency * time);
    return {
      principal,
      rate: rate * 100 + '%',
      time,
      frequency,
      finalAmount: parseFloat(amount.toFixed(2)),
      totalInterest: parseFloat((amount - principal).toFixed(2))
    };
  },

  // Text analysis
  textAnalysis: (text: string) => {
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    // Word frequency
    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    const topWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
    
    return {
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/g, '').length,
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      averageWordsPerSentence: parseFloat((words.length / sentences.length || 0).toFixed(2)),
      topWords,
      readingTime: Math.ceil(words.length / 200) + ' minutes' // Assuming 200 WPM
    };
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔬 Python-like compute function called');
    
    const { operation, data, params }: ComputeRequest = await req.json();
    
    if (!operation || !computeFunctions[operation as keyof typeof computeFunctions]) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid operation', 
          availableOperations: Object.keys(computeFunctions) 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔬 Executing operation: ${operation}`);
    const startTime = performance.now();
    
    // Execute the computation
    const result = computeFunctions[operation as keyof typeof computeFunctions](data, params);
    
    const endTime = performance.now();
    const executionTime = parseFloat((endTime - startTime).toFixed(2));
    
    console.log(`✅ Computation completed in ${executionTime}ms`);

    return new Response(
      JSON.stringify({ 
        operation,
        result,
        executionTime: executionTime + 'ms',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Compute function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Computation failed', 
        details: error.message,
        type: error.constructor.name
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});