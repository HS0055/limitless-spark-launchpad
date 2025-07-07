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
  private abortController: AbortController | null = null;

  constructor() {
    this.loadCache();
    this.preloadCommonStrings();
    this.setupMutationObserver();
  }

  private loadCache() {
    try {
      const savedData = localStorage.getItem('i18nCache');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Handle both old and new cache formats
        if (parsed.cache) {
          this.cache = parsed.cache;
          console.log('💾 Loaded persistent cache with', Object.keys(this.cache).length, 'translations');
        } else {
          this.cache = parsed; // Old format
          console.log('💾 Loaded legacy cache');
        }
      }
    } catch (error) {
      console.error('Failed to load translation cache:', error);
    }
  }

  private saveCache() {
    try {
      // Save with timestamp for persistence tracking
      const cacheData = {
        cache: this.cache,
        lastUpdated: Date.now(),
        version: '1.0'
      };
      localStorage.setItem('i18nCache', JSON.stringify(cacheData));
      console.log('💾 Cache saved with', Object.keys(this.cache).length, 'entries');
    } catch (error) {
      console.error('Failed to save translation cache:', error);
    }
  }

  private preloadCommonStrings() {
    // Pre-populate cache with EXTENSIVE common UI strings to make translation instant
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
      
      // All Hero section content
      'Master business skills with': { hy: 'Տիրապետիր բիզնես հմտություններին', ru: 'Овладей навыками бизнеса с', es: 'Domina las habilidades empresariales con' },
      'TopOne Academy': { hy: 'TopOne ակադեմիա', ru: 'TopOne Академия', es: 'TopOne Academia' },
      'Join the Business Fundamentals League and gain confidence through': { hy: 'Միացիր Բիզնես հիմունքների լիգային և ձեռք բեր վստահություն', ru: 'Присоединяйся к Лиге основ бизнеса и обретай уверенность через' },
      'visual learning': { hy: 'տեսարան ուսուցման միջոցով', ru: 'визуальное обучение', es: 'aprendizaje visual' },
      'Transform your business skills with bite-sized visual lessons designed to make complex concepts simple and actionable.': { 
        hy: 'Փոխակերպիր քո բիզնես հմտությունները կոճ-չափ տեսարան դասերով, որոնք նախագծված են բարդ հասկացությունները պարզ և գործնական դարձնելու համար:', 
        ru: 'Трансформируй свои бизнес-навыки с помощью коротких визуальных уроков, разработанных для того, чтобы сделать сложные концепции простыми и применимыми.',
        es: 'Transforma tus habilidades comerciales con lecciones visuales concisas diseñadas para hacer que los conceptos complejos sean simples y aplicables.'
      },
      'Join Business League': { hy: 'Միանալ բիզնես լիգային', ru: 'Присоединиться к бизнес-лиге', es: 'Unirse a la Liga Empresarial' },
      'Watch Preview': { hy: 'Դիտել նախադիտումը', ru: 'Смотреть превью', es: 'Ver Vista Previa' },
      
      // Stats & features  
      'Learning Leagues': { hy: 'Ուսուցման լիգաներ', ru: 'Лиги обучения', es: 'Ligas de Aprendizaje' },
      'Active Learners': { hy: 'Ակտիվ ուսանողներ', ru: 'Активные ученики', es: 'Estudiantes Activos' },
      'Average Rating': { hy: 'Միջին գնահատական', ru: 'Средний рейтинг', es: 'Calificación Promedio' },
      'Lesson Length': { hy: 'Դասի տևությունը', ru: 'Длительность урока', es: 'Duración de la Lección' },
      
      // How it works section
      'How': { hy: 'Ինչպես', ru: 'Как', es: 'Cómo' },
      'Works': { hy: 'է գործում', ru: 'работает', es: 'Funciona' },
      'Choose Your League': { hy: 'Ընտրեք ձեր լիգան', ru: 'Выберите свою лигу', es: 'Elige tu Liga' },
      'Learn Visually': { hy: 'Սովորեք տեսականորեն', ru: 'Учитесь визуально', es: 'Aprende Visualmente' },
      'Unlock & Achieve': { hy: 'Բացահայտեք և հասնեք', ru: 'Открывайте и достигайте', es: 'Desbloquea y Logra' },
      
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
    // Cancel any ongoing translation
    if (this.abortController) {
      this.abortController.abort();
    }
    
    if (targetLang === 'en') {
      this.restoreOriginalLanguage();
      return;
    }

    this.currentLanguage = targetLang;
    this.abortController = new AbortController();
    
    // INSTANT translation with cached content - no delays
    this.translateCachedContent(targetLang);
    
    // Only translate new content if absolutely necessary
    const uncachedTexts = this.collectUncachedTexts(targetLang);
    if (uncachedTexts.length > 0) {
      console.log(`💰 Translating ${uncachedTexts.length} new texts (one-time cost)`);
      setTimeout(() => this.translateNewContent(uncachedTexts, targetLang), 50);
    } else {
      console.log('✅ All content already cached - no API costs!');
    }
  }

  private async translateAllContent(targetLang: Language) {
    if (this.isTranslating) {
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

    // More selective collection to reduce API costs
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'SVG'];
          if (skipTags.includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
          if (parent.hasAttribute('data-no-translate')) return NodeFilter.FILTER_REJECT;
          
          const text = node.textContent?.trim();
          // Only accept meaningful text (3+ chars) to reduce costs
          return (text && text.length >= 3) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent?.trim();
      if (text && !seenTexts.has(text) && !this.cache[text]?.[targetLang]) {
        // Strict filtering to avoid unnecessary API calls
        if (!/^[\d\s\.,\-\+\(\)\[\]%$€£¥]*$/.test(text) && // Skip pure numbers/symbols
            !/^https?:\/\//.test(text) && // Skip URLs
            !/^[^\s]+@[^\s]+\.[^\s]+$/.test(text) && // Skip emails
            !/^[\/\\]/.test(text) && // Skip file paths
            !/^[A-Z]{2,}$/.test(text) && // Skip pure uppercase abbreviations
            text.length >= 3 && // Minimum length
            text.length <= 500) { // Maximum length to avoid huge costs
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
    const batchSize = 50; // Larger batches to reduce API costs
    
    const batchPromises = [];
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      batchPromises.push(this.translateBatch(batch, targetLang));
    }

    await Promise.allSettled(batchPromises);
    
    // Apply newly translated content immediately
    this.translateCachedContent(targetLang);
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

      // Update cache with new translations and save immediately
      Object.entries(result.data.translations).forEach(([original, translated]) => {
        if (!this.cache[original]) {
          this.cache[original] = {};
        }
        this.cache[original][targetLang] = translated as string;
      });
      
      // Save cache immediately to prevent re-translation
      this.saveCache();
      console.log('💰 Saved new translations - no future costs for these texts!');

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