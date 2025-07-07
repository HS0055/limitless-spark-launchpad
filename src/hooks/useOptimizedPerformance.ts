import { useEffect, useRef, useCallback, useState } from 'react';

interface PerformanceConfig {
  enableMouseTracking?: boolean;
  enableScrollTracking?: boolean;
  throttleMs?: number;
  enableIntersectionObserver?: boolean;
}

export const useOptimizedPerformance = (config: PerformanceConfig = {}) => {
  const {
    enableMouseTracking = false,
    enableScrollTracking = false,
    throttleMs = 16,
    enableIntersectionObserver = true
  } = config;

  const rafId = useRef<number | null>(null);
  const lastUpdateTime = useRef(0);

  // Optimized throttle using requestAnimationFrame
  const throttledCallback = useCallback((callback: () => void) => {
    if (rafId.current) return;

    rafId.current = requestAnimationFrame(() => {
      const now = performance.now();
      if (now - lastUpdateTime.current >= throttleMs) {
        callback();
        lastUpdateTime.current = now;
      }
      rafId.current = null;
    });
  }, [throttleMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  // Visibility API to pause expensive operations when tab is hidden
  const useVisibilityOptimization = useCallback(() => {
    const [isVisible, setIsVisible] = useState(!document.hidden);

    useEffect(() => {
      const handleVisibilityChange = () => {
        setIsVisible(!document.hidden);
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    return isVisible;
  }, []);

  // Memory usage monitoring
  const useMemoryMonitoring = useCallback(() => {
    useEffect(() => {
      const interval = setInterval(() => {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          const usagePercent = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
          
          if (usagePercent > 80) {
            console.warn('High memory usage detected:', usagePercent.toFixed(2) + '%');
            
            // Trigger garbage collection hints
            if ('gc' in window) {
              (window as any).gc();
            }
          }
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }, []);
  }, []);

  return {
    throttledCallback,
    useVisibilityOptimization,
    useMemoryMonitoring
  };
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
) => {
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(callback);
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [callback, options]);

  return targetRef;
};