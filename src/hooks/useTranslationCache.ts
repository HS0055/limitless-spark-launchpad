import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CacheEntry {
  original: string;
  translated: string;
  timestamp: number;
  hitCount: number;
}

interface TranslationCacheHook {
  getTranslation: (text: string, targetLang: string) => string | null;
  addTranslation: (original: string, translated: string, targetLang: string) => void;
  preloadCache: (targetLang: string) => Promise<void>;
  clearCache: () => void;
  getCacheStats: () => { size: number; hitRate: number; lastFetch: number };
}

const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 1000;
const FETCH_COOLDOWN = 30 * 1000; // 30 seconds between fetches

export const useTranslationCache = (): TranslationCacheHook => {
  const [cache, setCache] = useState<Map<string, Map<string, CacheEntry>>>(new Map());
  const lastFetchTime = useRef<Map<string, number>>(new Map());
  const hitCount = useRef(0);
  const missCount = useRef(0);

  // Load cache from localStorage on mount
  useEffect(() => {
    const loadPersistedCache = () => {
      try {
        const persistedData = localStorage.getItem('translation-cache-v2');
        if (persistedData) {
          const parsed = JSON.parse(persistedData);
          const newCache = new Map();
          
          Object.entries(parsed).forEach(([lang, entries]) => {
            const langMap = new Map();
            Object.entries(entries as any).forEach(([original, entry]) => {
              // Filter out expired entries
              if (Date.now() - (entry as CacheEntry).timestamp < CACHE_EXPIRY) {
                langMap.set(original, entry as CacheEntry);
              }
            });
            if (langMap.size > 0) {
              newCache.set(lang, langMap);
            }
          });
          
          setCache(newCache);
          console.log('📦 Loaded translation cache from localStorage');
        }
      } catch (error) {
        console.error('Failed to load translation cache:', error);
      }
    };

    loadPersistedCache();
  }, []);

  // Persist cache to localStorage
  const persistCache = useCallback((newCache: Map<string, Map<string, CacheEntry>>) => {
    try {
      const serializable: Record<string, Record<string, CacheEntry>> = {};
      newCache.forEach((langMap, lang) => {
        serializable[lang] = {};
        langMap.forEach((entry, original) => {
          serializable[lang][original] = entry;
        });
      });
      
      localStorage.setItem('translation-cache-v2', JSON.stringify(serializable));
    } catch (error) {
      console.error('Failed to persist translation cache:', error);
    }
  }, []);

  // Get translation from cache
  const getTranslation = useCallback((text: string, targetLang: string): string | null => {
    const langCache = cache.get(targetLang);
    if (!langCache) {
      missCount.current++;
      return null;
    }

    const entry = langCache.get(text.trim());
    if (!entry) {
      missCount.current++;
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
      // Remove expired entry
      langCache.delete(text.trim());
      setCache(new Map(cache));
      missCount.current++;
      return null;
    }

    // Update hit count and return translation
    entry.hitCount++;
    hitCount.current++;
    return entry.translated;
  }, [cache]);

  // Add translation to cache
  const addTranslation = useCallback((original: string, translated: string, targetLang: string) => {
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      let langCache = newCache.get(targetLang);
      
      if (!langCache) {
        langCache = new Map();
        newCache.set(targetLang, langCache);
      }

      // Implement LRU eviction if cache is too large
      if (langCache.size >= MAX_CACHE_SIZE) {
        // Remove least recently used entries (lowest hit count)
        const entries = Array.from(langCache.entries());
        entries.sort((a, b) => a[1].hitCount - b[1].hitCount);
        
        // Remove oldest 20% of entries
        const toRemove = Math.floor(entries.length * 0.2);
        for (let i = 0; i < toRemove; i++) {
          langCache.delete(entries[i][0]);
        }
      }

      langCache.set(original.trim(), {
        original: original.trim(),
        translated,
        timestamp: Date.now(),
        hitCount: 0
      });

      persistCache(newCache);
      return newCache;
    });
  }, [persistCache]);

  // Preload cache from Supabase with rate limiting
  const preloadCache = useCallback(async (targetLang: string): Promise<void> => {
    const lastFetch = lastFetchTime.current.get(targetLang) || 0;
    const now = Date.now();
    
    // Rate limiting: don't fetch if we fetched recently
    if (now - lastFetch < FETCH_COOLDOWN) {
      console.log(`🚫 Cache fetch blocked for ${targetLang} (cooldown)`);
      return;
    }

    try {
      lastFetchTime.current.set(targetLang, now);
      
      console.log(`🌐 Preloading cache for ${targetLang}...`);
      const { data, error } = await supabase
        .from('translation_cache')
        .select('original, translated')
        .eq('target_lang', targetLang)
        .order('inserted_at', { ascending: false })
        .limit(500); // Limit to most recent translations

      if (error) {
        console.error('Failed to preload cache:', error);
        return;
      }

      if (data && data.length > 0) {
        setCache(prevCache => {
          const newCache = new Map(prevCache);
          let langCache = newCache.get(targetLang) || new Map();
          
          let newCount = 0;
          data.forEach(item => {
            if (!langCache.has(item.original)) {
              langCache.set(item.original, {
                original: item.original,
                translated: item.translated,
                timestamp: now,
                hitCount: 0
              });
              newCount++;
            }
          });

          newCache.set(targetLang, langCache);
          persistCache(newCache);
          
          console.log(`✅ Preloaded ${newCount} new translations for ${targetLang}`);
          return newCache;
        });
      }
    } catch (error) {
      console.error('Failed to preload translation cache:', error);
    }
  }, [persistCache]);

  // Clear cache
  const clearCache = useCallback(() => {
    setCache(new Map());
    localStorage.removeItem('translation-cache-v2');
    hitCount.current = 0;
    missCount.current = 0;
    lastFetchTime.current.clear();
    console.log('🗑️ Translation cache cleared');
  }, []);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    const totalSize = Array.from(cache.values()).reduce((sum, langCache) => sum + langCache.size, 0);
    const totalRequests = hitCount.current + missCount.current;
    const hitRate = totalRequests > 0 ? hitCount.current / totalRequests : 0;
    
    return {
      size: totalSize,
      hitRate,
      lastFetch: Math.max(...Array.from(lastFetchTime.current.values()), 0)
    };
  }, [cache]);

  return {
    getTranslation,
    addTranslation,
    preloadCache,
    clearCache,
    getCacheStats
  };
};