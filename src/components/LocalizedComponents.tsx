import React, { Suspense, useState } from 'react';
import { useTranslation } from '@/contexts/EnhancedTranslationContext';

interface TranslationSkeletonProps {
  width?: string;
  height?: string;
  lines?: number;
}

export const TranslationSkeleton = ({ width = '100%', height = '1.2em', lines = 1 }: TranslationSkeletonProps) => {
  return (
    <div className="animate-pulse space-y-1">
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i}
          className="bg-muted/50 rounded"
          style={{ 
            width: lines > 1 && i === lines - 1 ? '75%' : width, 
            height 
          }}
        />
      ))}
    </div>
  );
};

interface LocalizedTextProps {
  children: string;
  namespace?: string;
  fallback?: string;
  showReportButton?: boolean;
  skeleton?: {
    width?: string;
    height?: string;
    lines?: number;
  };
}

export const LocalizedText = ({ 
  children, 
  namespace, 
  fallback, 
  showReportButton = false,
  skeleton 
}: LocalizedTextProps) => {
  const { translate, currentLanguage, isLoading, reportTranslation } = useTranslation();
  const [showReport, setShowReport] = useState(false);
  
  // Show skeleton during loading for non-English languages
  if (isLoading && currentLanguage !== 'en') {
    return <TranslationSkeleton {...skeleton} />;
  }
  
  const translatedText = translate(children, namespace) || fallback || children;
  const needsTranslation = currentLanguage !== 'en' && translatedText === children;

  return (
    <span 
      className={`relative inline-block ${needsTranslation ? 'bg-yellow-100 dark:bg-yellow-900/20 px-1 rounded' : ''}`}
      onMouseEnter={() => showReportButton && setShowReport(true)}
      onMouseLeave={() => setShowReport(false)}
      data-i18n={children}
      data-namespace={namespace}
    >
      {translatedText}
      {showReportButton && showReport && needsTranslation && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            reportTranslation(children, translatedText);
          }}
          className="absolute -top-8 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg hover:bg-blue-700 z-50"
          title="Report translation issue"
        >
          🚨 Report
        </button>
      )}
    </span>
  );
};

interface TranslatedBlockProps {
  children: React.ReactNode;
  namespace?: string;
  showReportButton?: boolean;
}

export const TranslatedBlock = ({ children, namespace, showReportButton = true }: TranslatedBlockProps) => {
  const { currentLanguage } = useTranslation();
  
  return (
    <div 
      className={`relative ${showReportButton ? 'hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-800 rounded transition-all' : ''}`}
      data-translate-block
      data-namespace={namespace}
    >
      {children}
      {showReportButton && currentLanguage !== 'en' && (
        <button
          className="absolute top-2 right-2 opacity-0 hover:opacity-100 group-hover:opacity-100 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg hover:bg-blue-700 transition-opacity"
          title="Report translation issues in this block"
          onClick={() => {
            // Find all text in this block and queue for review
            const textNodes: string[] = [];
            const walker = document.createTreeWalker(
              document.currentScript?.parentElement || document.body,
              NodeFilter.SHOW_TEXT
            );
            let node;
            while (node = walker.nextNode()) {
              const text = node.textContent?.trim();
              if (text && text.length > 3) {
                textNodes.push(text);
              }
            }
            console.log('Reporting translation block:', textNodes);
          }}
        >
          🚨
        </button>
      )}
    </div>
  );
};

// HOC for automatically wrapping components with translation
export function withTranslation<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  namespace?: string
) {
  return function TranslatedComponent(props: T) {
    return (
      <Suspense fallback={<TranslationSkeleton lines={2} />}>
        <TranslatedBlock namespace={namespace}>
          <Component {...props} />
        </TranslatedBlock>
      </Suspense>
    );
  };
}

// Helper for creating localized loading states
interface LocalizedLoadingProps {
  message?: string;
  namespace?: string;
}

export const LocalizedLoading = ({ message = 'Loading...', namespace = 'common' }: LocalizedLoadingProps) => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <LocalizedText namespace={namespace}>{message}</LocalizedText>
      </div>
    </div>
  );
};

// Error boundary with localized messages
interface LocalizedErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class LocalizedErrorBoundary extends React.Component<
  { children: React.ReactNode; namespace?: string },
  LocalizedErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; namespace?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): LocalizedErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LocalizedErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            <LocalizedText namespace={this.props.namespace || 'common'}>
              Something went wrong
            </LocalizedText>
          </h2>
          <p className="text-red-600 dark:text-red-300">
            <LocalizedText namespace={this.props.namespace || 'common'}>
              Please refresh the page or try again later.
            </LocalizedText>
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-red-500">
                Technical Details
              </summary>
              <pre className="text-xs bg-red-100 dark:bg-red-900/40 p-2 rounded mt-1 overflow-auto">
                {this.state.error?.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}