import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
  context?: string;
}

interface TranslationResult {
  translatedText: string;
  confidence?: number;
  cached: boolean;
  duration: number;
}

export const useRealTimeTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [queue, setQueue] = useState<TranslationRequest[]>([]);
  const [results, setResults] = useState<Map<string, TranslationResult>>(new Map());
  const processingRef = useRef(false);
  const { toast } = useToast();

  // Generate unique key for translation request
  const getRequestKey = useCallback((request: TranslationRequest): string => {
    return `${request.text}-${request.sourceLang}-${request.targetLang}-${request.context || ''}`;
  }, []);

  // Process translation queue with batching
  const processQueue = useCallback(async () => {
    if (processingRef.current || queue.length === 0) return;

    processingRef.current = true;
    setIsTranslating(true);

    try {
      // Process in batches of 5 for optimal performance
      const batchSize = 5;
      const batch = queue.slice(0, batchSize);
      
      const startTime = performance.now();
      
      // Use batch processing for better performance
      const batchResults = await apiClient.batchInvoke(
        batch.map(request => ({
          functionName: 'ai-translate',
          body: {
            text: request.text,
            sourceLang: request.sourceLang,
            targetLang: request.targetLang,
            context: request.context,
            visionMode: true
          }
        }))
      );

      const endTime = performance.now();
      const totalDuration = endTime - startTime;

      // Process results
      const newResults = new Map(results);
      
      batchResults.forEach((result, index) => {
        const request = batch[index];
        const key = getRequestKey(request);
        
        if (result.status === 'fulfilled' && !result.value.error) {
          newResults.set(key, {
            translatedText: result.value.data.translatedText,
            confidence: result.value.data.confidence,
            cached: false,
            duration: totalDuration / batchResults.length
          });
        } else {
          console.error('Translation failed for:', request, result);
          toast({
            title: "Translation Error",
            description: `Failed to translate: ${request.text.substring(0, 50)}...`,
            variant: "destructive"
          });
        }
      });

      setResults(newResults);
      setQueue(prev => prev.slice(batchSize));

      // Continue processing if more items in queue
      const currentBatchSize = 5; // Match the batchSize from above
      if (queue.length > currentBatchSize) {
        setTimeout(() => processQueue(), 100);
      }

    } catch (error) {
      console.error('Batch translation error:', error);
      toast({
        title: "Translation System Error",
        description: "Multiple translations failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      processingRef.current = false;
      setIsTranslating(queue.length > 5); // Use the same batch size value
    }
  }, [queue, results, getRequestKey, toast]);

  // Add translation to queue
  const queueTranslation = useCallback((request: TranslationRequest) => {
    const key = getRequestKey(request);
    
    // Check if already translated
    if (results.has(key)) {
      return results.get(key)!;
    }

    // Add to queue if not already there
    setQueue(prev => {
      const exists = prev.some(item => getRequestKey(item) === key);
      if (!exists) {
        return [...prev, request];
      }
      return prev;
    });

    return null;
  }, [results, getRequestKey]);

  // Get translation result
  const getTranslation = useCallback((request: TranslationRequest): TranslationResult | null => {
    const key = getRequestKey(request);
    return results.get(key) || null;
  }, [results, getRequestKey]);

  // Clear specific translation or all
  const clearTranslations = useCallback((request?: TranslationRequest) => {
    if (request) {
      const key = getRequestKey(request);
      setResults(prev => {
        const newResults = new Map(prev);
        newResults.delete(key);
        return newResults;
      });
    } else {
      setResults(new Map());
    }
  }, [getRequestKey]);

  // Process queue when it changes
  useEffect(() => {
    if (queue.length > 0 && !processingRef.current) {
      const timer = setTimeout(() => processQueue(), 500); // Batch delay
      return () => clearTimeout(timer);
    }
  }, [queue, processQueue]);

  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const stats = apiClient.getCacheStats();
      if (stats.hitRate < 0.5 && results.size > 10) {
        console.warn('Low cache hit rate detected:', stats);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [results.size]);

  return {
    queueTranslation,
    getTranslation,
    clearTranslations,
    isTranslating,
    queueLength: queue.length,
    resultsCount: results.size,
    cacheStats: apiClient.getCacheStats()
  };
};