import { supabase } from '@/integrations/supabase/client';

// Enhanced API client with optimizations
class OptimizedAPIClient {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private pendingRequests = new Map<string, Promise<any>>();

  // Intelligent caching with TTL
  private getCacheKey(functionName: string, body: any): string {
    return `${functionName}-${JSON.stringify(body)}`;
  }

  private isValidCache(cacheEntry: { timestamp: number; ttl: number }): boolean {
    return Date.now() - cacheEntry.timestamp < cacheEntry.ttl;
  }

  // Optimized function invocation with deduplication and caching
  async invoke(
    functionName: string, 
    options: { body?: any; headers?: Record<string, string> } = {},
    cacheOptions: { ttl?: number; skipCache?: boolean } = {}
  ) {
    const { body, headers } = options;
    const { ttl = 30000, skipCache = false } = cacheOptions; // 30 second default cache

    const cacheKey = this.getCacheKey(functionName, body);

    // Return cached result if valid
    if (!skipCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && this.isValidCache(cached)) {
        console.log(`Cache hit for ${functionName}`);
        return cached.data;
      }
    }

    // Deduplicate concurrent requests
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`Deduplicating request for ${functionName}`);
      return this.pendingRequests.get(cacheKey);
    }

    // Create new request with performance monitoring
    const startTime = performance.now();
    const requestPromise = supabase.functions
      .invoke(functionName, { body, headers })
      .then(result => {
        const endTime = performance.now();
        console.log(`${functionName} completed in ${(endTime - startTime).toFixed(2)}ms`);

        // Cache successful results
        if (!result.error && !skipCache) {
          this.cache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
            ttl
          });
        }

        // Clean up pending requests
        this.pendingRequests.delete(cacheKey);

        return result;
      })
      .catch(error => {
        // Clean up pending requests on error
        this.pendingRequests.delete(cacheKey);
        
        // Enhanced error logging
        console.error(`Error in ${functionName}:`, {
          error,
          body,
          timestamp: new Date().toISOString(),
          duration: `${(performance.now() - startTime).toFixed(2)}ms`
        });
        
        throw error;
      });

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  // Batch operations for better performance
  async batchInvoke(requests: Array<{
    functionName: string;
    body?: any;
    headers?: Record<string, string>;
  }>) {
    const startTime = performance.now();
    
    try {
      const results = await Promise.allSettled(
        requests.map(req => this.invoke(req.functionName, { body: req.body, headers: req.headers }))
      );
      
      const endTime = performance.now();
      console.log(`Batch operation completed in ${(endTime - startTime).toFixed(2)}ms`);
      
      return results;
    } catch (error) {
      console.error('Batch operation failed:', error);
      throw error;
    }
  }

  // Clear cache for specific function or all
  clearCache(functionName?: string) {
    if (functionName) {
      const keysToDelete = Array.from(this.cache.keys()).filter(key => 
        key.startsWith(`${functionName}-`)
      );
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  // Get cache statistics
  getCacheStats() {
    const entries = Array.from(this.cache.entries());
    const validEntries = entries.filter(([_, entry]) => this.isValidCache(entry));
    
    return {
      totalEntries: entries.length,
      validEntries: validEntries.length,
      hitRate: validEntries.length / Math.max(entries.length, 1),
      cacheSize: JSON.stringify(Array.from(this.cache.entries())).length
    };
  }
}

// Singleton instance
export const apiClient = new OptimizedAPIClient();

// Error boundary for API calls
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public functionName?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Retry utility with exponential backoff
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw new APIError(
          `Operation failed after ${maxAttempts} attempts: ${lastError.message}`,
          undefined,
          undefined,
          { attempts: maxAttempts, lastError }
        );
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.warn(`Attempt ${attempt} failed, retrying in ${delay.toFixed(0)}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};