// Performance optimization utilities

// Debounce function for limiting function calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

// Throttle function using requestAnimationFrame
export const throttleRAF = <T extends (...args: any[]) => any>(
  func: T
): ((...args: Parameters<T>) => void) => {
  let rafId: number | null = null;
  
  return (...args: Parameters<T>) => {
    if (rafId) return;
    
    rafId = requestAnimationFrame(() => {
      func(...args);
      rafId = null;
    });
  };
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const usagePercent = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
    
    if (usagePercent > 85) {
      console.warn(`High memory usage: ${usagePercent.toFixed(2)}%`);
      
      // Trigger garbage collection if available
      if ('gc' in window && typeof (window as any).gc === 'function') {
        (window as any).gc();
      }
    }
    
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      percentage: usagePercent
    };
  }
  
  return null;
};

// Check if tab is visible (Page Visibility API)
export const isTabVisible = (): boolean => {
  return !document.hidden;
};

// Preload critical resources
export const preloadResource = (href: string, as: string, type?: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  
  document.head.appendChild(link);
};

// Lazy load images with intersection observer
export const createLazyImageObserver = (
  callback: (entry: IntersectionObserverEntry) => void
) => {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach(callback);
    },
    {
      threshold: 0.1,
      rootMargin: '50px'
    }
  );
};

// Optimize bundle splitting and code splitting points
export const loadComponentLazily = async <T>(
  importFunc: () => Promise<{ default: T }>
): Promise<T> => {
  try {
    const module = await importFunc();
    return module.default;
  } catch (error) {
    console.error('Failed to load component:', error);
    throw error;
  }
};

// Performance metrics collection
export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
}

export const collectPerformanceMetrics = (): PerformanceMetrics => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const loadTime = navigation.loadEventEnd - navigation.fetchStart;
  
  const metrics: PerformanceMetrics = {
    loadTime
  };
  
  // Collect Web Vitals if available
  try {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      metrics.firstContentfulPaint = fcpEntry.startTime;
    }
    
    // Use PerformanceObserver for other metrics if available
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              metrics.largestContentfulPaint = entry.startTime;
            }
            if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              metrics.cumulativeLayoutShift = (metrics.cumulativeLayoutShift || 0) + (entry as any).value;
            }
          });
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift'] });
      } catch (e) {
        // PerformanceObserver not supported or failed
      }
    }
  } catch (error) {
    console.warn('Failed to collect performance metrics:', error);
  }
  
  return metrics;
};

// Network quality detection
export const detectNetworkQuality = (): 'slow' | 'fast' | 'unknown' => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection) {
      // Consider 2G or slow-2g as slow
      if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
        return 'slow';
      }
      // Consider 4g as fast
      if (connection.effectiveType === '4g') {
        return 'fast';
      }
    }
  }
  
  return 'unknown';
};

// Resource cleanup helper
export const createCleanupManager = () => {
  const cleanupFunctions: (() => void)[] = [];
  
  return {
    add: (cleanup: () => void) => {
      cleanupFunctions.push(cleanup);
    },
    cleanup: () => {
      cleanupFunctions.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.error('Cleanup function failed:', error);
        }
      });
      cleanupFunctions.length = 0;
    }
  };
};