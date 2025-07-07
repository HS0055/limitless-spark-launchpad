import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Languages, CheckCircle, AlertCircle } from 'lucide-react';

interface TranslationLoaderProps {
  isVisible: boolean;
  progress: number;
  currentLanguage: string;
  targetLanguage: string;
  phase: 'detecting' | 'translating' | 'applying' | 'complete' | 'error';
  translatedCount?: number;
  totalCount?: number;
  error?: string | null;
  className?: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hy: 'Armenian',
  ru: 'Russian',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic'
};

const PHASE_MESSAGES = {
  detecting: 'Scanning page content...',
  translating: 'Translating content...',
  applying: 'Applying translations...',
  complete: 'Translation complete!',
  error: 'Translation failed'
};

const PHASE_ICONS = {
  detecting: <Loader2 className="w-4 h-4 animate-spin" />,
  translating: <Languages className="w-4 h-4 animate-pulse" />,
  applying: <Loader2 className="w-4 h-4 animate-spin" />,
  complete: <CheckCircle className="w-4 h-4 text-green-500" />,
  error: <AlertCircle className="w-4 h-4 text-red-500" />
};

export const TranslationLoader: React.FC<TranslationLoaderProps> = ({
  isVisible,
  progress,
  currentLanguage,
  targetLanguage,
  phase,
  translatedCount = 0,
  totalCount = 0,
  error,
  className = ''
}) => {
  if (!isVisible) return null;

  const currentLangName = LANGUAGE_NAMES[currentLanguage] || currentLanguage;
  const targetLangName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out ${className}`}>
      <div className="bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg p-4 min-w-[300px] max-w-[400px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {PHASE_ICONS[phase]}
            <span className="text-sm font-medium text-foreground">
              {PHASE_MESSAGES[phase]}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {currentLangName}
            </Badge>
            <span className="text-xs text-muted-foreground">→</span>
            <Badge variant="default" className="text-xs">
              {targetLangName}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        {phase !== 'complete' && phase !== 'error' && (
          <div className="mb-3">
            <Progress 
              value={progress} 
              className="h-2"
              style={{
                background: 'var(--muted)',
              }}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-muted-foreground">
                {Math.round(progress)}%
              </span>
              {totalCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {translatedCount} / {totalCount} items
                </span>
              )}
            </div>
          </div>
        )}

        {/* Phase-specific content */}
        {phase === 'detecting' && (
          <div className="text-xs text-muted-foreground">
            Identifying translatable content on the page...
          </div>
        )}

        {phase === 'translating' && (
          <div className="text-xs text-muted-foreground">
            Using AI to translate content into {targetLangName}...
          </div>
        )}

        {phase === 'applying' && (
          <div className="text-xs text-muted-foreground">
            Seamlessly updating page content...
          </div>
        )}

        {phase === 'complete' && (
          <div className="flex items-center gap-2 text-xs text-green-600">
            <CheckCircle className="w-3 h-3" />
            Page successfully translated to {targetLangName}
          </div>
        )}

        {phase === 'error' && error && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
            <div className="font-medium mb-1">Translation Failed</div>
            <div className="text-red-500">{error}</div>
          </div>
        )}

        {/* Subtle animation for active states */}
        {(phase === 'translating' || phase === 'applying') && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-lg animate-pulse" />
        )}
      </div>
    </div>
  );
};

// Skeleton component for individual text elements during translation
interface TextSkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export const TextSkeleton: React.FC<TextSkeletonProps> = ({
  width = '100%',
  height = '1em',
  className = ''
}) => {
  return (
    <div 
      className={`bg-muted animate-pulse rounded ${className}`}
      style={{
        width,
        height,
        minHeight: height
      }}
      aria-hidden="true"
    />
  );
};

// Wrapper component that shows skeleton while translating
interface TranslatingTextProps {
  isTranslating: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export const TranslatingText: React.FC<TranslatingTextProps> = ({
  isTranslating,
  children,
  fallback,
  className = ''
}) => {
  if (isTranslating) {
    return (
      <div className={`relative ${className}`}>
        {fallback || <TextSkeleton />}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
      </div>
    );
  }

  return <>{children}</>;
};

// Hook for managing translation loader state
export const useTranslationLoader = () => {
  const [loaderState, setLoaderState] = React.useState({
    isVisible: false,
    progress: 0,
    phase: 'detecting' as TranslationLoaderProps['phase'],
    translatedCount: 0,
    totalCount: 0,
    error: null as string | null
  });

  const showLoader = React.useCallback((currentLang: string, targetLang: string) => {
    setLoaderState({
      isVisible: true,
      progress: 0,
      phase: 'detecting',
      translatedCount: 0,
      totalCount: 0,
      error: null
    });
  }, []);

  const updateProgress = React.useCallback((
    progress: number,
    phase: TranslationLoaderProps['phase'],
    translatedCount?: number,
    totalCount?: number
  ) => {
    setLoaderState(prev => ({
      ...prev,
      progress,
      phase,
      translatedCount: translatedCount ?? prev.translatedCount,
      totalCount: totalCount ?? prev.totalCount
    }));
  }, []);

  const hideLoader = React.useCallback((delay: number = 2000) => {
    setTimeout(() => {
      setLoaderState(prev => ({ ...prev, isVisible: false }));
    }, delay);
  }, []);

  const setError = React.useCallback((error: string) => {
    setLoaderState(prev => ({
      ...prev,
      phase: 'error',
      error
    }));
  }, []);

  return {
    loaderState,
    showLoader,
    updateProgress,
    hideLoader,
    setError
  };
};