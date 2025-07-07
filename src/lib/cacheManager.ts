// Advanced caching system with cookies, localStorage, and memory
import { supabase } from '@/integrations/supabase/client';

interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  pageViews: string[];
  interactions: Array<{
    type: string;
    data: any;
    timestamp: number;
  }>;
  language: string;
  translations: number;
  errors: Array<{
    error: string;
    timestamp: number;
    context: any;
  }>;
}

class CacheManager {
  private memoryCache = new Map<string, CacheEntry>();
  private readonly CACHE_PREFIX = 'app_cache_';
  private readonly SESSION_KEY = 'user_session';
  private currentSession: UserSession | null = null;
  private sessionTimer?: NodeJS.Timeout;

  constructor() {
    this.initializeSession();
    this.startSessionTracking();
    this.cleanupExpiredCache();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.saveSession();
    });
  }

  // Session Management
  private initializeSession(): void {
    try {
      const savedSession = this.getFromStorage(this.SESSION_KEY);
      const now = Date.now();

      if (savedSession && (now - savedSession.lastActivity) < 30 * 60 * 1000) { // 30 min session timeout
        this.currentSession = savedSession;
        this.currentSession.lastActivity = now;
      } else {
        this.currentSession = {
          sessionId: this.generateSessionId(),
          startTime: now,
          lastActivity: now,
          pageViews: [window.location.pathname],
          interactions: [],
          language: 'en',
          translations: 0,
          errors: []
        };
      }
      
      this.saveSession();
    } catch (error) {
      console.warn('Failed to initialize session:', error);
      this.currentSession = {
        sessionId: this.generateSessionId(),
        startTime: Date.now(),
        lastActivity: Date.now(),
        pageViews: [window.location.pathname],
        interactions: [],
        language: 'en',
        translations: 0,
        errors: []
      };
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private startSessionTracking(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.trackInteraction('page_focus', { visible: true });
      } else {
        this.trackInteraction('page_blur', { visible: false });
      }
    });

    // Track route changes
    let currentPath = window.location.pathname;
    const checkRouteChange = () => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        this.trackPageView(currentPath);
      }
    };
    
    this.sessionTimer = setInterval(() => {
      checkRouteChange();
      this.updateActivity();
      this.saveSession();
    }, 5000); // Update every 5 seconds
  }

  // Cache Operations
  set<T>(key: string, value: T, ttl: number = 3600000): void { // 1 hour default TTL
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl,
      key
    };

    // Store in memory
    this.memoryCache.set(key, entry);

    // Store in localStorage with error handling
    try {
      this.setInStorage(this.CACHE_PREFIX + key, entry);
    } catch (error) {
      console.warn('Failed to store in localStorage:', error);
    }

    // Store in cookies for cross-session persistence (smaller data only)
    if (this.getObjectSize(value) < 2000) { // Under 2KB
      try {
        this.setCookie(key, JSON.stringify(value), ttl);
      } catch (error) {
        console.warn('Failed to store in cookies:', error);
      }
    }
  }

  get<T>(key: string): T | null {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isValidEntry(memoryEntry)) {
      return memoryEntry.value;
    }

    // Check localStorage
    try {
      const storageEntry = this.getFromStorage(this.CACHE_PREFIX + key);
      if (storageEntry && this.isValidEntry(storageEntry)) {
        // Restore to memory cache
        this.memoryCache.set(key, storageEntry);
        return storageEntry.value;
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
    }

    // Check cookies as fallback
    try {
      const cookieValue = this.getCookie(key);
      if (cookieValue) {
        return JSON.parse(cookieValue);
      }
    } catch (error) {
      console.warn('Failed to read from cookies:', error);
    }

    return null;
  }

  delete(key: string): void {
    this.memoryCache.delete(key);
    
    try {
      this.removeFromStorage(this.CACHE_PREFIX + key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
    
    this.deleteCookie(key);
  }

  clear(): void {
    this.memoryCache.clear();
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  // Translation-specific caching
  async getTranslation(sourceText: string, sourceLang: string, targetLang: string): Promise<string | null> {
    const cacheKey = `translation_${this.hashString(sourceText)}_${sourceLang}_${targetLang}`;
    
    // Check cache first
    const cached = this.get<string>(cacheKey);
    if (cached) {
      return cached;
    }

    // Check database
    try {
      const { data } = await supabase
        .from('translations')
        .select('translated_text')
        .eq('source_text', sourceText.trim())
        .eq('source_language', sourceLang)
        .eq('target_language', targetLang)
        .limit(1)
        .single();

      if (data?.translated_text) {
        // Cache the result
        this.set(cacheKey, data.translated_text, 7 * 24 * 60 * 60 * 1000); // 7 days
        return data.translated_text;
      }
    } catch (error) {
      console.warn('Database translation lookup failed:', error);
    }

    return null;
  }

  async setTranslation(sourceText: string, sourceLang: string, targetLang: string, translation: string, userId?: string): Promise<void> {
    const cacheKey = `translation_${this.hashString(sourceText)}_${sourceLang}_${targetLang}`;
    
    // Cache the translation
    this.set(cacheKey, translation, 7 * 24 * 60 * 60 * 1000); // 7 days

    // Save to database if user is available
    if (userId) {
      try {
        await supabase.from('translations').insert({
          source_text: sourceText.trim(),
          source_language: sourceLang,
          target_language: targetLang,
          translated_text: translation,
          user_id: userId
        });
      } catch (error) {
        console.warn('Failed to save translation to database:', error);
      }
    }

    this.trackInteraction('translation_cached', {
      sourceLength: sourceText.length,
      targetLang,
      cached: true
    });
  }

  // Session tracking methods
  trackPageView(path: string): void {
    if (!this.currentSession) return;
    
    this.currentSession.pageViews.push(path);
    this.currentSession.lastActivity = Date.now();
    this.saveSession();
  }

  trackInteraction(type: string, data: any): void {
    if (!this.currentSession) return;
    
    this.currentSession.interactions.push({
      type,
      data,
      timestamp: Date.now()
    });
    
    // Keep only last 100 interactions to prevent memory bloat
    if (this.currentSession.interactions.length > 100) {
      this.currentSession.interactions = this.currentSession.interactions.slice(-100);
    }
    
    this.updateActivity();
  }

  trackError(error: string, context: any): void {
    if (!this.currentSession) return;
    
    this.currentSession.errors.push({
      error,
      timestamp: Date.now(),
      context
    });
    
    // Keep only last 50 errors
    if (this.currentSession.errors.length > 50) {
      this.currentSession.errors = this.currentSession.errors.slice(-50);
    }
    
    console.error('Tracked error:', { error, context, sessionId: this.currentSession.sessionId });
  }

  trackTranslation(): void {
    if (!this.currentSession) return;
    this.currentSession.translations++;
    this.trackInteraction('translation_completed', { count: this.currentSession.translations });
  }

  updateLanguage(language: string): void {
    if (!this.currentSession) return;
    this.currentSession.language = language;
    this.trackInteraction('language_changed', { language });
  }

  updateUserId(userId: string): void {
    if (!this.currentSession) return;
    this.currentSession.userId = userId;
    this.saveSession();
  }

  private updateActivity(): void {
    if (!this.currentSession) return;
    this.currentSession.lastActivity = Date.now();
  }

  private saveSession(): void {
    if (!this.currentSession) return;
    
    try {
      this.setInStorage(this.SESSION_KEY, this.currentSession);
    } catch (error) {
      console.warn('Failed to save session:', error);
    }
  }

  getSessionStats(): UserSession | null {
    return this.currentSession;
  }

  // Analytics and monitoring
  getPerformanceStats(): {
    memoryCache: number;
    localStorageSize: number;
    sessionDuration: number;
    pageViews: number;
    interactions: number;
    translations: number;
    errors: number;
  } {
    const session = this.currentSession;
    return {
      memoryCache: this.memoryCache.size,
      localStorageSize: this.getLocalStorageSize(),
      sessionDuration: session ? Date.now() - session.startTime : 0,
      pageViews: session?.pageViews.length || 0,
      interactions: session?.interactions.length || 0,
      translations: session?.translations || 0,
      errors: session?.errors.length || 0
    };
  }

  // Utility methods
  private isValidEntry(entry: CacheEntry): boolean {
    return (Date.now() - entry.timestamp) < entry.ttl;
  }

  private cleanupExpiredCache(): void {
    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isValidEntry(entry)) {
        this.memoryCache.delete(key);
      }
    }

    // Clean localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          try {
            const entry = JSON.parse(localStorage.getItem(key) || '{}');
            if (entry.timestamp && !this.isValidEntry(entry)) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            // Remove invalid entries
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup localStorage:', error);
    }

    // Schedule next cleanup
    setTimeout(() => this.cleanupExpiredCache(), 5 * 60 * 1000); // Every 5 minutes
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private getObjectSize(obj: any): number {
    return JSON.stringify(obj).length;
  }

  private getLocalStorageSize(): number {
    try {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      return 0;
    }
  }

  // Storage helpers with error handling
  private setInStorage(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private getFromStorage(key: string): any {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  private removeFromStorage(key: string): void {
    localStorage.removeItem(key);
  }

  // Cookie helpers
  private setCookie(name: string, value: string, ttl: number): void {
    const expires = new Date(Date.now() + ttl).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
    return null;
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  // Cleanup
  destroy(): void {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
    }
    this.saveSession();
  }
}

// Singleton instance
export const cacheManager = new CacheManager();

// Global error tracking
window.addEventListener('error', (event) => {
  cacheManager.trackError(event.error?.message || 'Unknown error', {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  });
});

window.addEventListener('unhandledrejection', (event) => {
  cacheManager.trackError('Unhandled Promise Rejection', {
    reason: event.reason,
    promise: event.promise
  });
});
