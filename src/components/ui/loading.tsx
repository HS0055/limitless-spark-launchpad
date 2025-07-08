import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'button';
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  variant = 'text',
  lines = 1
}) => {
  const baseClasses = 'animate-pulse bg-muted rounded';
  
  const variants = {
    text: 'h-4 w-full',
    card: 'h-48 w-full',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24'
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variants.text} ${
              index === lines - 1 ? 'w-3/4' : ''
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} />
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div
      className={`${sizes[size]} border-2 border-primary border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  spinner?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  children,
  skeleton,
  spinner = false
}) => {
  if (isLoading) {
    if (skeleton) {
      return <>{skeleton}</>;
    }
    
    if (spinner) {
      return (
        <div className="flex items-center justify-center p-4">
          <LoadingSpinner />
        </div>
      );
    }
    
    return <LoadingSkeleton />;
  }

  return <>{children}</>;
};