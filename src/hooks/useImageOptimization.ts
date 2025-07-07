import { useState, useEffect, useRef } from 'react';

interface ImageOptimizationOptions {
  enableLazyLoading?: boolean;
  enableWebP?: boolean;
  placeholder?: string;
  quality?: number;
}

export const useImageOptimization = (
  src: string,
  options: ImageOptimizationOptions = {}
) => {
  const {
    enableLazyLoading = true,
    enableWebP = true,
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=',
    quality = 85
  } = options;

  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // WebP support detection
  const supportsWebP = useRef<boolean | null>(null);

  const checkWebPSupport = async (): Promise<boolean> => {
    if (supportsWebP.current !== null) {
      return supportsWebP.current;
    }

    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        supportsWebP.current = webP.height === 2;
        resolve(supportsWebP.current);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==';
    });
  };

  // Convert image URL to optimized format
  const getOptimizedSrc = async (originalSrc: string): Promise<string> => {
    if (!enableWebP) return originalSrc;

    const webPSupported = await checkWebPSupport();
    if (!webPSupported) return originalSrc;

    // Simple WebP conversion for local images
    if (originalSrc.includes('/assets/') && !originalSrc.includes('.webp')) {
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }

    return originalSrc;
  };

  useEffect(() => {
    if (!enableLazyLoading) {
      loadImage();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, enableLazyLoading]);

  const loadImage = async () => {
    try {
      const optimizedSrc = await getOptimizedSrc(src);
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(optimizedSrc);
        setIsLoaded(true);
        setHasError(false);
      };
      
      img.onerror = () => {
        setHasError(true);
        // Fallback to original if optimized version fails
        if (optimizedSrc !== src) {
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            setImageSrc(src);
            setIsLoaded(true);
          };
          fallbackImg.onerror = () => setHasError(true);
          fallbackImg.src = src;
        }
      };
      
      img.src = optimizedSrc;
    } catch (error) {
      console.error('Image optimization failed:', error);
      setHasError(true);
    }
  };

  return {
    src: imageSrc,
    isLoaded,
    hasError,
    ref: imgRef
  };
};

// Preload critical images
export const preloadImages = (srcs: string[]) => {
  srcs.forEach((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

// Progressive image loading component
export const useProgressiveImage = (lowQualitySrc: string, highQualitySrc: string) => {
  const [src, setSrc] = useState(lowQualitySrc);
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setSrc(highQualitySrc);
      setIsHighQualityLoaded(true);
    };
    img.src = highQualitySrc;
  }, [highQualitySrc]);

  return { src, isHighQualityLoaded };
};