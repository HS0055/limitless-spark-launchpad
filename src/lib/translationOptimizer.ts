interface TranslationCacheEntry {
  translated: string;
  confidence: number;
  timestamp: number;
  frequency: number;
  context: string;
}

interface ContentFingerprint {
  hash: string;
  context: string;
  frequency: number;
  lastUsed: number;
}

interface TranslationQueue {
  id: string;
  texts: string[];
  targetLanguage: string;
  priority: number;
  resolve: (translations: Map<string, string>) => void;
  reject: (error: Error) => void;
}

class TranslationOptimizer {
  private memoryCache = new Map<string, TranslationCacheEntry>();
  private fingerprintCache = new Map<string, ContentFingerprint>();
  private requestQueue: TranslationQueue[] = [];
  private isProcessing = false;
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_QUEUE_SIZE = 10;

  constructor() {
    this.loadFromLocalStorage();
    this.setupPeriodicCleanup();
  }

  // Generate content fingerprint for intelligent caching
  generateFingerprint(text: string, context: string): string {
    const hash = this.simpleHash(text + context);
    const fingerprint: ContentFingerprint = {
      hash,
      context,
      frequency: this.fingerprintCache.get(hash)?.frequency || 0 + 1,
      lastUsed: Date.now()
    };
    
    this.fingerprintCache.set(hash, fingerprint);
    return hash;
  }

  // Simple hash function for fingerprinting
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Get cached translation with confidence scoring
  getCachedTranslation(text: string, targetLanguage: string, context?: string): {
    translation: string;
    confidence: number;
  } | null {
    const cacheKey = `${text}-${targetLanguage}`;
    const entry = this.memoryCache.get(cacheKey);
    
    if (!entry) {
      // Check localStorage as fallback
      return this.getFromLocalStorage(cacheKey);
    }

    // Check if cache is still valid
    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.memoryCache.delete(cacheKey);
      return null;
    }

    // Update frequency and recency
    entry.frequency++;
    entry.timestamp = Date.now();

    // Calculate confidence based on frequency, recency, and context match
    let confidence = Math.min(entry.confidence + (entry.frequency * 0.1), 1.0);
    if (context && entry.context === context) {
      confidence += 0.1;
    }

    return {
      translation: entry.translated,
      confidence: Math.min(confidence, 1.0)
    };
  }

  // Cache translation with confidence scoring
  cacheTranslation(
    original: string, 
    translated: string, 
    targetLanguage: string,
    confidence: number = 0.8,
    context?: string
  ): void {
    const cacheKey = `${original}-${targetLanguage}`;
    const entry: TranslationCacheEntry = {
      translated,
      confidence,
      timestamp: Date.now(),
      frequency: 1,
      context: context || 'unknown'
    };

    this.memoryCache.set(cacheKey, entry);
    
    // Also save to localStorage for persistence
    this.saveToLocalStorage(cacheKey, entry);
    
    // Cleanup if cache is too large
    this.cleanupCache();
  }

  // Queue translation request with priority
  async queueTranslation(
    texts: string[],
    targetLanguage: string,
    priority: number = 1
  ): Promise<Map<string, string>> {
    return new Promise((resolve, reject) => {
      // Check if queue is full
      if (this.requestQueue.length >= this.MAX_QUEUE_SIZE) {
        reject(new Error('Translation queue is full'));
        return;
      }

      const queueItem: TranslationQueue = {
        id: Math.random().toString(36).substring(7),
        texts,
        targetLanguage,
        priority,
        resolve,
        reject
      };

      // Insert based on priority (higher priority first)
      const insertIndex = this.requestQueue.findIndex(item => item.priority < priority);
      if (insertIndex === -1) {
        this.requestQueue.push(queueItem);
      } else {
        this.requestQueue.splice(insertIndex, 0, queueItem);
      }

      this.processQueue();
    });
  }

  // Process translation queue
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const queueItem = this.requestQueue.shift()!;
      
      try {
        const translations = await this.executeTranslation(
          queueItem.texts,
          queueItem.targetLanguage
        );
        queueItem.resolve(translations);
      } catch (error) {
        queueItem.reject(error as Error);
      }

      // Small delay to prevent API overload
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
  }

  // Execute actual translation
  private async executeTranslation(
    texts: string[],
    targetLanguage: string
  ): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    // Check cache first
    const uncachedTexts: string[] = [];
    texts.forEach(text => {
      const cached = this.getCachedTranslation(text, targetLanguage);
      if (cached && cached.confidence > 0.7) {
        results.set(text, cached.translation);
      } else {
        uncachedTexts.push(text);
      }
    });

    // Translate uncached texts
    if (uncachedTexts.length > 0) {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        
        const { data, error } = await supabase.functions.invoke('generate-web-content', {
          body: {
            content: uncachedTexts.join('\n---SEPARATOR---\n'),
            type: 'translation',
            targetLanguage,
            tone: 'professional'
          }
        });

        if (error) throw error;

        const translatedTexts = data.content.split('\n---SEPARATOR---\n');
        
        uncachedTexts.forEach((original, index) => {
          if (translatedTexts[index]) {
            const translated = translatedTexts[index].trim();
            results.set(original, translated);
            
            // Cache with confidence based on text length and complexity
            const confidence = this.calculateTranslationConfidence(original, translated);
            this.cacheTranslation(original, translated, targetLanguage, confidence);
          }
        });

      } catch (error) {
        console.error('Translation API error:', error);
        throw error;
      }
    }

    return results;
  }

  // Calculate translation confidence based on various factors
  private calculateTranslationConfidence(original: string, translated: string): number {
    let confidence = 0.8; // Base confidence
    
    // Factor in length (very short or very long translations might be less reliable)
    const lengthRatio = translated.length / original.length;
    if (lengthRatio > 0.5 && lengthRatio < 2.0) {
      confidence += 0.1;
    }
    
    // Factor in complexity (simple words get higher confidence)
    const complexity = original.split(' ').length;
    if (complexity <= 3) {
      confidence += 0.1;
    }
    
    // Check for preserved formatting
    const originalFormatting = (original.match(/[.!?,:;]/g) || []).length;
    const translatedFormatting = (translated.match(/[.!?,:;]/g) || []).length;
    if (originalFormatting === translatedFormatting) {
      confidence += 0.05;
    }

    return Math.min(confidence, 1.0);
  }

  // Load cache from localStorage
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('translation-cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([key, value]) => {
          this.memoryCache.set(key, value as TranslationCacheEntry);
        });
      }
    } catch (error) {
      console.warn('Failed to load translation cache from localStorage:', error);
    }
  }

  // Save specific entry to localStorage
  private saveToLocalStorage(key: string, entry: TranslationCacheEntry): void {
    try {
      const existing = JSON.parse(localStorage.getItem('translation-cache') || '{}');
      existing[key] = entry;
      localStorage.setItem('translation-cache', JSON.stringify(existing));
    } catch (error) {
      console.warn('Failed to save translation to localStorage:', error);
    }
  }

  // Get from localStorage
  private getFromLocalStorage(key: string): {
    translation: string;
    confidence: number;
  } | null {
    try {
      const stored = localStorage.getItem('translation-cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        const entry = parsed[key] as TranslationCacheEntry;
        if (entry && Date.now() - entry.timestamp < this.CACHE_DURATION) {
          return {
            translation: entry.translated,
            confidence: entry.confidence
          };
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve from localStorage:', error);
    }
    return null;
  }

  // Cleanup cache using LRU strategy
  private cleanupCache(): void {
    if (this.memoryCache.size <= this.MAX_CACHE_SIZE) return;

    // Convert to array and sort by frequency and recency
    const entries = Array.from(this.memoryCache.entries())
      .map(([key, value]) => ({ key, value, score: value.frequency + (Date.now() - value.timestamp) / 1000000 }))
      .sort((a, b) => a.score - b.score);

    // Remove least valuable entries
    const toRemove = entries.slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.2));
    toRemove.forEach(({ key }) => this.memoryCache.delete(key));
  }

  // Setup periodic cleanup
  private setupPeriodicCleanup(): void {
    setInterval(() => {
      this.cleanupCache();
      // Also cleanup localStorage
      this.cleanupLocalStorage();
    }, 60 * 60 * 1000); // Every hour
  }

  // Cleanup localStorage
  private cleanupLocalStorage(): void {
    try {
      const stored = localStorage.getItem('translation-cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        const cleaned: Record<string, TranslationCacheEntry> = {};
        
        Object.entries(parsed).forEach(([key, value]) => {
          const entry = value as TranslationCacheEntry;
          if (Date.now() - entry.timestamp < this.CACHE_DURATION) {
            cleaned[key] = entry;
          }
        });
        
        localStorage.setItem('translation-cache', JSON.stringify(cleaned));
      }
    } catch (error) {
      console.warn('Failed to cleanup localStorage:', error);
    }
  }

  // Get cache statistics
  getCacheStats(): {
    memorySize: number;
    hitRate: number;
    avgConfidence: number;
  } {
    const entries = Array.from(this.memoryCache.values());
    const avgConfidence = entries.reduce((sum, entry) => sum + entry.confidence, 0) / entries.length || 0;
    
    return {
      memorySize: this.memoryCache.size,
      hitRate: 0, // Would need to track requests to calculate
      avgConfidence
    };
  }
}

// Singleton instance
export const translationOptimizer = new TranslationOptimizer();