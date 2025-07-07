export type Language = 'en' | 'hy' | 'ru';

export interface TranslationRequest {
  text: string;
  sourceLang: Language;
  targetLang: Language;
  context?: string;
  screenshot?: string;
}

export interface TranslationResponse {
  translatedText: string;
  sourceLang: Language;
  targetLang: Language;
  confidence: number;
  visionUsed?: boolean;
}

export interface TranslationQueueItem {
  element: Element;
  text: string;
  context: string;
  resolve: (value: string) => void;
  reject: (error: Error) => void;
  retryCount: number;
}

export interface TranslationCache {
  [key: string]: {
    [targetLang in Language]?: string;
  };
}