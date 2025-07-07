import { TranslationQueueItem, Language } from './types';
import { apiClient } from '@/lib/apiClient';

export class TranslationQueue {
  private queue: TranslationQueueItem[] = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private readonly RATE_LIMIT_DELAY = 1300; // 1.3s between requests
  private readonly MAX_RETRIES = 3;

  async add(item: Omit<TranslationQueueItem, 'retryCount'>): Promise<string> {
    return new Promise((resolve, reject) => {
      this.queue.push({ ...item, retryCount: 0, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      
      try {
        // Rate limiting
        const timeSinceLastRequest = Date.now() - this.lastRequestTime;
        if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
          const delay = this.RATE_LIMIT_DELAY - timeSinceLastRequest;
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const result = await this.translateText(item.text, item.context);
        this.lastRequestTime = Date.now();
        item.resolve(result);
        
      } catch (error) {
        if (item.retryCount < this.MAX_RETRIES && this.isRateLimitError(error)) {
          item.retryCount++;
          const backoffDelay = Math.pow(2, item.retryCount) * 2000;
          setTimeout(() => {
            this.queue.unshift(item);
            this.processQueue();
          }, backoffDelay);
        } else {
          item.reject(error instanceof Error ? error : new Error('Translation failed'));
        }
      }
    }

    this.isProcessing = false;
  }

  private async translateText(text: string, context: string): Promise<string> {
    const response = await apiClient.invoke('ai-vision-translate', {
      body: {
        text,
        sourceLang: 'en',
        targetLang: this.getCurrentLanguage(),
        context
      }
    });

    if (response.error) {
      throw new Error(response.error);
    }

    return response.data.translatedText;
  }

  private getCurrentLanguage(): Language {
    // Get from your language context
    return (localStorage.getItem('language') as Language) || 'en';
  }

  private isRateLimitError(error: any): boolean {
    return error?.message?.includes('429') || error?.message?.includes('rate limit');
  }

  clear(): void {
    this.queue = [];
  }
}