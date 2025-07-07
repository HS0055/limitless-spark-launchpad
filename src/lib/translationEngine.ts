import { apiClient } from '@/lib/apiClient';

export type Language = 'en' | 'hy' | 'ru' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'ar';

interface TranslationCache {
  [key: string]: {
    [targetLang: string]: string;
  };
}

class TranslationEngine {
  private cache: TranslationCache = {};
  private isTranslating = false;
  private currentLanguage: Language = 'en';
  private observer: MutationObserver | null = null;
  private debounceTimer: number | null = null;
  private translatedElements = new WeakSet<Element>();

  constructor() {
    this.loadCache();
    this.preloadCommonStrings();
    this.setupMutationObserver();
  }

  private loadCache() {
    try {
      const savedCache = localStorage.getItem('i18nCache');
      if (savedCache) {
        this.cache = JSON.parse(savedCache);
        console.log('💾 Loaded translation cache');
      }
    } catch (error) {
      console.error('Failed to load translation cache:', error);
    }
  }

  private saveCache() {
    try {
      localStorage.setItem('i18nCache', JSON.stringify(this.cache));
    } catch (error) {
      console.error('Failed to save translation cache:', error);
    }
  }

  private preloadCommonStrings() {
    // Pre-populate cache with common UI strings to make translation instant
    const commonStrings = {
      // Navigation & buttons
      'Home': { hy: 'Գլխավոր', ru: 'Главная', es: 'Inicio', fr: 'Accueil', de: 'Startseite' },
      'Get Started': { hy: 'Սկսել', ru: 'Начать', es: 'Comenzar', fr: 'Commencer', de: 'Loslegen' },
      'Learn More': { hy: 'Իմանալ ավելին', ru: 'Узнать больше', es: 'Saber más', fr: 'En savoir plus', de: 'Mehr erfahren' },
      'Sign In': { hy: 'Մուտք գործել', ru: 'Войти', es: 'Iniciar sesión', fr: 'Connexion', de: 'Anmelden' },
      'Sign Up': { hy: 'Գրանցվել', ru: 'Регистрация', es: 'Registrarse', fr: 'S\'inscrire', de: 'Registrieren' },
      'Programs': { hy: 'Ծրագրեր', ru: 'Программы', es: 'Programas', fr: 'Programmes', de: 'Programme' },
      'Business': { hy: 'Բիզնես', ru: 'Бизнес', es: 'Negocio', fr: 'Affaires', de: 'Geschäft' },
      'Community': { hy: 'Համայնք', ru: 'Сообщество', es: 'Comunidad', fr: 'Communauté', de: 'Gemeinschaft' },
      'Settings': { hy: 'Կարգավորումներ', ru: 'Настройки', es: 'Configuración', fr: 'Paramètres', de: 'Einstellungen' },
      'Translator': { hy: 'Թարգմանիչ', ru: 'Переводчик', es: 'Traductor', fr: 'Traducteur', de: 'Übersetzer' },
      
      // Common phrases
      'Loading...': { hy: 'Բեռնվում է...', ru: 'Загрузка...', es: 'Cargando...', fr: 'Chargement...', de: 'Laden...' },
      'Welcome': { hy: 'Բարի գալուստ', ru: 'Добро пожаловать', es: 'Bienvenido', fr: 'Bienvenue', de: 'Willkommen' },
      'Learn': { hy: 'Սովորել', ru: 'Изучать', es: 'Aprender', fr: 'Apprendre', de: 'Lernen' },
      'Continue': { hy: 'Շարունակել', ru: 'Продолжить', es: 'Continuar', fr: 'Continuer', de: 'Weiter' },
      'Start': { hy: 'Սկսել', ru: 'Начать', es: 'Empezar', fr: 'Commencer', de: 'Beginnen' },
      'Next': { hy: 'Հաջորդ', ru: 'Следующий', es: 'Siguiente', fr: 'Suivant', de: 'Weiter' },
      'Previous': { hy: 'Նախորդ', ru: 'Предыдущий', es: 'Anterior', fr: 'Précédent', de: 'Zurück' },
      'Save': { hy: 'Պահպանել', ru: 'Сохранить', es: 'Guardar', fr: 'Enregistrer', de: 'Speichern' },
      'Cancel': { hy: 'Չեղարկել', ru: 'Отмена', es: 'Cancelar', fr: 'Annuler', de: 'Abbrechen' },
      
      // Hero section
      'Master business skills with': { hy: 'Տիրապետիր բիզնես հմտություններին', ru: 'Овладей навыками бизнеса с' },
      'TopOne Academy': { hy: 'TopOne ակադեմիա', ru: 'TopOne Академия' },
      'visual learning': { hy: 'տեսարան ուսուցման միջոցով', ru: 'визуальное обучение' },
      'Join Business League': { hy: 'Միանալ բիզնես լիգային', ru: 'Присоединиться к бизнес-лиге' },
      'Watch Preview': { hy: 'Դիտել նախադիտումը', ru: 'Смотреть превью' },
      
      // Stats & features
      'Learning Leagues': { hy: 'Ուսուցման լիգաներ', ru: 'Лиги обучения' },
      'Active Learners': { hy: 'Ակտիվ ուսանողներ', ru: 'Активные ученики' },
      'Average Rating': { hy: 'Միջին գնահատական', ru: 'Средний рейтинг' },
      'Lesson Length': { hy: 'Դասի տևությունը', ru: 'Длительность урока' },
      'Still have questions?': { hy: 'Դեռ հարցե՞ր ունեք', ru: 'Есть еще вопросы?' },
    };

    // Pre-populate cache
    Object.entries(commonStrings).forEach(([english, translations]) => {
      this.cache[english] = translations;
    });
  }

  private setupMutationObserver() {
    this.observer = new MutationObserver(() => {
      if (this.currentLanguage !== 'en' && !this.isTranslating) {
        this.debouncedRetranslate();
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  private debouncedRetranslate() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = window.setTimeout(() => {
      console.log('🔄 Dynamic content detected, re-translating…');
      this.translateAllContent(this.currentLanguage);
    }, 100); // Reduced from 150ms
  }

  async translateAll(targetLang: Language) {
    if (targetLang === 'en') {
      this.restoreOriginalLanguage();
      return;
    }

    this.currentLanguage = targetLang;
    await this.translateAllContent(targetLang);
  }

  private async translateAllContent(targetLang: Language) {
    if (this.isTranslating) {
      console.log('⚠️ Translation already in progress');
      return;
    }

    this.isTranslating = true;

    try {
      // Step 1: Instantly translate all cached content (should be most UI elements)
      this.translateCachedContent(targetLang);

      // Step 2: Collect any remaining untranslated content
      const uncachedTexts = this.collectUncachedTexts(targetLang);
      
      if (uncachedTexts.length > 0) {
        console.log(`🔄 Found ${uncachedTexts.length} new texts to translate`);
        await this.translateNewContent(uncachedTexts, targetLang);
        // Apply the newly translated content
        this.translateCachedContent(targetLang);
      }

    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      this.isTranslating = false;
    }
  }

  private translateCachedContent(targetLang: Language) {
    // Translate document title
    const originalTitle = document.title;
    const translatedTitle = this.cache[originalTitle]?.[targetLang];
    if (translatedTitle && translatedTitle !== originalTitle) {
      document.title = translatedTitle;
    }

    // Fast translation of all text content
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          // Skip excluded elements
          const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE'];
          if (skipTags.includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
          if (parent.hasAttribute('data-no-translate')) return NodeFilter.FILTER_REJECT;
          
          const text = node.textContent?.trim();
          return (text && text.length > 1) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      }
    );

    const textNodesToTranslate: Text[] = [];
    let node;
    while (node = walker.nextNode()) {
      textNodesToTranslate.push(node as Text);
    }

    // Batch translate text nodes for better performance
    textNodesToTranslate.forEach(textNode => {
      const originalText = textNode.textContent?.trim();
      if (!originalText) return;

      const translation = this.cache[originalText]?.[targetLang];
      if (translation && translation !== originalText) {
        console.log(`🔄 Replacing "${originalText}" → "${translation}"`);
        textNode.textContent = translation;
      }
    });

    // Also translate common attributes
    this.translateAttributes(targetLang);
  }

  private translateAttributes(targetLang: Language) {
    const attributesToTranslate = ['placeholder', 'title', 'aria-label', 'alt'];
    
    attributesToTranslate.forEach(attr => {
      document.querySelectorAll(`[${attr}]`).forEach(element => {
        const originalValue = element.getAttribute(attr);
        if (!originalValue || originalValue.trim().length < 2) return;
        
        const translation = this.cache[originalValue.trim()]?.[targetLang];
        if (translation && translation !== originalValue) {
          element.setAttribute(attr, translation);
        }
      });
    });
  }

  private collectUncachedTexts(targetLang: Language): string[] {
    const uncachedTexts: string[] = [];
    const seenTexts = new Set<string>();

    // Collect all text content that isn't cached
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE'];
          if (skipTags.includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
          if (parent.hasAttribute('data-no-translate')) return NodeFilter.FILTER_REJECT;
          
          const text = node.textContent?.trim();
          return (text && text.length > 2) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent?.trim();
      if (text && !seenTexts.has(text) && !this.cache[text]?.[targetLang]) {
        // Skip numbers, URLs, emails
        if (!/^[\d\s\.,\-\+\(\)\[\]]+$/.test(text) && 
            !/^https?:\/\//.test(text) && 
            !/^[^\s]+@[^\s]+\.[^\s]+$/.test(text)) {
          seenTexts.add(text);
          uncachedTexts.push(text);
        }
      }
    }

    // Also collect attribute values
    const attributesToTranslate = ['placeholder', 'title', 'aria-label', 'alt'];
    attributesToTranslate.forEach(attr => {
      document.querySelectorAll(`[${attr}]`).forEach(element => {
        const value = element.getAttribute(attr)?.trim();
        if (value && value.length > 2 && !seenTexts.has(value) && !this.cache[value]?.[targetLang]) {
          seenTexts.add(value);
          uncachedTexts.push(value);
        }
      });
    });

    return uncachedTexts;
  }

  private async translateNewContent(texts: string[], targetLang: Language) {
    const batchSize = 30; // Larger batches for better performance
    
    const batchPromises = [];
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      batchPromises.push(this.translateBatch(batch, targetLang));
    }

    await Promise.allSettled(batchPromises);
    this.saveCache();
  }

  private async translateBatch(texts: string[], targetLang: Language): Promise<void> {
    try {
      const result = await apiClient.invoke('batch-translate', {
        body: {
          texts,
          targetLang,
          context: 'Web application content'
        }
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Update cache with new translations
      Object.entries(result.data.translations).forEach(([original, translated]) => {
        if (!this.cache[original]) {
          this.cache[original] = {};
        }
        this.cache[original][targetLang] = translated as string;
      });

    } catch (error) {
      console.error('❌ Batch translation failed:', error);
    }
  }

  private restoreOriginalLanguage() {
    this.currentLanguage = 'en';
    location.reload(); // Simple but effective way to restore original content
  }

  // Hook methods for external integration
  onLanguageChange(newLanguage: Language) {
    console.log(`🌐 Language changed to: ${newLanguage}`);
    this.translateAll(newLanguage);
  }

  onRouteChange(newPath: string) {
    console.log(`🌐 Route changed → ${newPath}`);
    if (this.currentLanguage !== 'en') {
      setTimeout(() => {
        this.translateAllContent(this.currentLanguage);
      }, 50); // Very fast re-translation for route changes
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
}

// Create singleton instance
export const translationEngine = new TranslationEngine();