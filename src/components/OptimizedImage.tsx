import React, { useState, useEffect, useRef } from 'react';
import { useImageOptimization } from '@/hooks/useImageOptimization';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  enableLazyLoading?: boolean;
  enableWebP?: boolean;
  placeholder?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  enableLazyLoading = true,
  enableWebP = true,
  placeholder,
  className = '',
  onLoad,
  onError,
  ...props
}) => {
  const { src: optimizedSrc, isLoaded, hasError, ref } = useImageOptimization(src, {
    enableLazyLoading,
    enableWebP,
    placeholder
  });

  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setShowImage(true);
      onLoad?.();
    }
  }, [isLoaded, onLoad]);

  useEffect(() => {
    if (hasError) {
      onError?.();
    }
  }, [hasError, onError]);

  return (
    <div className="relative overflow-hidden">
      {!showImage && (
        <div 
          className={`absolute inset-0 bg-muted animate-pulse ${className}`}
          style={{ aspectRatio: 'inherit' }}
        />
      )}
      
      <img
        ref={ref}
        src={optimizedSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          showImage ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        loading={enableLazyLoading ? 'lazy' : 'eager'}
        decoding="async"
        {...props}
      />
      
      {hasError && (
        <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}>
          <span className="text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;