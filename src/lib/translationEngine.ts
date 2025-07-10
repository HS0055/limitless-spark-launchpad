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
  private lastTranslatedPath: string = '';
  private performanceThrottle = 0; // Performance throttling counter

  constructor() {
    this.loadCache();
    this.preloadCommonStrings();
    this.setupMutationObserver();
    this.setupRealtimeSync();
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
    // Pre-populate cache with EXTENSIVE common UI strings for ALL LANGUAGES to make translation instant
    const commonStrings = {
      // Navigation & buttons - ALL LANGUAGES
      'Home': { 
        hy: 'Գլխավոր', ru: 'Главная', es: 'Inicio', fr: 'Accueil', de: 'Startseite',
        zh: '首页', ja: 'ホーム', ko: '홈', ar: 'الرئيسية'
      },
      'Get Started': { 
        hy: 'Սկսել', ru: 'Начать', es: 'Comenzar', fr: 'Commencer', de: 'Loslegen',
        zh: '开始', ja: '始める', ko: '시작하기', ar: 'ابدأ'
      },
      'Learn More': { 
        hy: 'Իմանալ ավելին', ru: 'Узнать больше', es: 'Saber más', fr: 'En savoir plus', de: 'Mehr erfahren',
        zh: '了解更多', ja: 'もっと詳しく', ko: '더 알아보기', ar: 'اعرف المزيد'
      },
      'Sign In': { 
        hy: 'Մուտք գործել', ru: 'Войти', es: 'Iniciar sesión', fr: 'Connexion', de: 'Anmelden',
        zh: '登录', ja: 'ログイン', ko: '로그인', ar: 'تسجيل الدخول'
      },
      'Sign Up': { 
        hy: 'Գրանցվել', ru: 'Регистрация', es: 'Registrarse', fr: 'S\'inscrire', de: 'Registrieren',
        zh: '注册', ja: '登録', ko: '회원가입', ar: 'إنشاء حساب'
      },
      'Programs': { 
        hy: 'Ծրագրեր', ru: 'Программы', es: 'Programas', fr: 'Programmes', de: 'Programme',
        zh: '程序', ja: 'プログラム', ko: '프로그램', ar: 'البرامج'
      },
      'Business': { 
        hy: 'Բիզնես', ru: 'Бизнес', es: 'Negocio', fr: 'Affaires', de: 'Geschäft',
        zh: '商业', ja: 'ビジネス', ko: '비즈니스', ar: 'الأعمال'
      },
      'Community': { 
        hy: 'Համայնք', ru: 'Сообщество', es: 'Comunidad', fr: 'Communauté', de: 'Gemeinschaft',
        zh: '社区', ja: 'コミュニティ', ko: '커뮤니티', ar: 'المجتمع'
      },
      'Settings': { 
        hy: 'Կարգավորումներ', ru: 'Настройки', es: 'Configuración', fr: 'Paramètres', de: 'Einstellungen',
        zh: '设置', ja: '設定', ko: '설정', ar: 'الإعدادات'
      },
      'Translator': { 
        hy: 'Թարգմանիչ', ru: 'Переводчик', es: 'Traductor', fr: 'Traducteur', de: 'Übersetzer',
        zh: '翻译器', ja: '翻訳者', ko: '번역기', ar: 'المترجم'
      },
      'Dashboard': {
        hy: 'Վահանակ', ru: 'Панель управления', es: 'Panel', fr: 'Tableau de bord', de: 'Dashboard',
        zh: '仪表板', ja: 'ダッシュボード', ko: '대시보드', ar: 'لوحة القيادة'
      },
      'AI Tools': {
        hy: 'AI գործիքներ', ru: 'AI инструменты', es: 'Herramientas de IA', fr: 'Outils IA', de: 'KI-Werkzeuge',
        zh: 'AI工具', ja: 'AIツール', ko: 'AI 도구', ar: 'أدوات الذكاء الاصطناعي'
      },
      
      // All Hero section content - ALL LANGUAGES
      'Master business skills with': { 
        hy: 'Տիրապետիր բիզնես հմտություններին', ru: 'Овладей навыками бизнеса с', es: 'Domina las habilidades empresariales con',
        fr: 'Maîtrisez les compétences commerciales avec', de: 'Meistern Sie Geschäftsfähigkeiten mit',
        zh: '掌握商业技能', ja: 'ビジネススキルをマスターする', ko: '비즈니스 스킬 마스터하기', ar: 'اتقن المهارات التجارية مع'
      },
      'TopOne Academy': { 
        hy: 'TopOne ակադեմիա', ru: 'TopOne Академия', es: 'TopOne Academia',
        fr: 'TopOne Académie', de: 'TopOne Akademie',
        zh: 'TopOne 学院', ja: 'TopOne アカデミー', ko: 'TopOne 아카데미', ar: 'أكاديمية TopOne'
      },
      'visual learning': { 
        hy: 'տեսարան ուսուցման միջոցով', ru: 'визуальное обучение', es: 'aprendizaje visual',
        fr: 'apprentissage visuel', de: 'visuelles Lernen',
        zh: '视觉学习', ja: 'ビジュアル学習', ko: '시각적 학습', ar: 'التعلم البصري'
      },
      
      // Stats & features - ALL LANGUAGES
      'Learning Leagues': { 
        hy: 'Ուսուցման լիգաներ', ru: 'Лиги обучения', es: 'Ligas de Aprendizaje',
        fr: 'Ligues d\'apprentissage', de: 'Lernligen',
        zh: '学习联盟', ja: '学習リーグ', ko: '학습 리그', ar: 'دوريات التعلم'
      },
      'Active Learners': { 
        hy: 'Ակտիվ ուսանողներ', ru: 'Активные ученики', es: 'Estudiantes Activos',
        fr: 'Apprenants actifs', de: 'Aktive Lernende',
        zh: '活跃学习者', ja: 'アクティブ学習者', ko: '활성 학습자', ar: 'المتعلمون النشطون'
      },
      'Average Rating': { 
        hy: 'Միջին գնահատական', ru: 'Средний рейтинг', es: 'Calificación Promedio',
        fr: 'Note moyenne', de: 'Durchschnittsbewertung',
        zh: '平均评分', ja: '平均評価', ko: '평균 평점', ar: 'التقييم المتوسط'
      },
      'Lesson Length': { 
        hy: 'Դասի տևությունը', ru: 'Длительность урока', es: 'Duración de la Lección',
        fr: 'Durée de la leçon', de: 'Lektionsdauer',
        zh: '课程时长', ja: 'レッスンの長さ', ko: '수업 시간', ar: 'مدة الدرس'
      },
      
      // How it works section - ALL LANGUAGES
      'How': { 
        hy: 'Ինչպես', ru: 'Как', es: 'Cómo',
        fr: 'Comment', de: 'Wie',
        zh: '如何', ja: 'どのように', ko: '어떻게', ar: 'كيف'
      },
      'Works': { 
        hy: 'է գործում', ru: 'работает', es: 'Funciona',
        fr: 'ça marche', de: 'funktioniert',
        zh: '工作', ja: '動作する', ko: '작동', ar: 'يعمل'
      },
      'Choose Your League': { 
        hy: 'Ընտրեք ձեր լիգան', ru: 'Выберите свою лигу', es: 'Elige tu Liga',
        fr: 'Choisissez votre ligue', de: 'Wählen Sie Ihre Liga',
        zh: '选择你的联盟', ja: 'リーグを選択', ko: '리그 선택', ar: 'اختر دوريتك'
      },
      'Learn Visually': { 
        hy: 'Սովորեք տեսականորեն', ru: 'Учитесь визуально', es: 'Aprende Visualmente',
        fr: 'Apprenez visuellement', de: 'Visuell lernen',
        zh: '视觉学习', ja: 'ビジュアルで学ぶ', ko: '시각적으로 학습', ar: 'تعلم بصرياً'
      },
      'Unlock & Achieve': { 
        hy: 'Բացահայտեք և հասնեք', ru: 'Открывайте и достигайте', es: 'Desbloquea y Logra',
        fr: 'Débloquez et réalisez', de: 'Freischalten und erreichen',
        zh: '解锁并实现', ja: 'アンロックして達成', ko: '잠금 해제 및 달성', ar: 'افتح واحقق'
      },
      
      // Common phrases - ALL LANGUAGES
      'Loading...': { 
        hy: 'Բեռնվում է...', ru: 'Загрузка...', es: 'Cargando...', fr: 'Chargement...', de: 'Laden...',
        zh: '加载中...', ja: '読み込み中...', ko: '로딩 중...', ar: 'جار التحميل...'
      },
      'Welcome': { 
        hy: 'Բարի գալուստ', ru: 'Добро пожаловать', es: 'Bienvenido', fr: 'Bienvenue', de: 'Willkommen',
        zh: '欢迎', ja: 'ようこそ', ko: '환영합니다', ar: 'مرحباً'
      },
      'Learn': { 
        hy: 'Սովորել', ru: 'Изучать', es: 'Aprender', fr: 'Apprendre', de: 'Lernen',
        zh: '学习', ja: '学ぶ', ko: '배우기', ar: 'تعلم'
      },
      'Continue': { 
        hy: 'Շարունակել', ru: 'Продолжить', es: 'Continuar', fr: 'Continuer', de: 'Weiter',
        zh: '继续', ja: '続ける', ko: '계속', ar: 'استمر'
      },
      'Start': { 
        hy: 'Սկսել', ru: 'Начать', es: 'Empezar', fr: 'Commencer', de: 'Beginnen',
        zh: '开始', ja: '開始', ko: '시작', ar: 'ابدأ'
      },
      'Next': { 
        hy: 'Հաջորդ', ru: 'Следующий', es: 'Siguiente', fr: 'Suivant', de: 'Weiter',
        zh: '下一个', ja: '次', ko: '다음', ar: 'التالي'
      },
      'Previous': { 
        hy: 'Նախորդ', ru: 'Предыдущий', es: 'Anterior', fr: 'Précédent', de: 'Zurück',
        zh: '上一个', ja: '前', ko: '이전', ar: 'السابق'
      },
      'Save': { 
        hy: 'Պահպանել', ru: 'Сохранить', es: 'Guardar', fr: 'Enregistrer', de: 'Speichern',
        zh: '保存', ja: '保存', ko: '저장', ar: 'حفظ'
      },
      'Cancel': { 
        hy: 'Չեղարկել', ru: 'Отмена', es: 'Cancelar', fr: 'Annuler', de: 'Abbrechen',
        zh: '取消', ja: 'キャンセル', ko: '취소', ar: 'إلغاء'
      },
      'Still have questions?': { 
        hy: 'Դեռ հարցե՞ր ունեք', ru: 'Есть еще вопросы?', es: '¿Aún tienes preguntas?',
        fr: 'Vous avez encore des questions?', de: 'Haben Sie noch Fragen?',
        zh: '还有问题吗？', ja: 'まだ質問がありますか？', ko: '아직 질문이 있나요?', ar: 'لا تزال لديك أسئلة؟'
      },
    };

    // Pre-populate cache for ALL languages
    Object.entries(commonStrings).forEach(([english, translations]) => {
      this.cache[english] = translations;
    });
    
    console.log(`🌍 Pre-loaded ${Object.keys(commonStrings).length} common strings for ALL languages`);
  }

  private setupMutationObserver() {
    this.observer = new MutationObserver((mutations) => {
      // PERFORMANCE FIX: Throttle mutations to prevent excessive processing
      this.performanceThrottle++;
      if (this.performanceThrottle % 10 !== 0) return; // Only process every 10th mutation

      // Enhanced blocking conditions
      if (this.currentLanguage !== 'en' && 
          !this.isTranslating && 
          !document.getElementById('translation-freeze-styles') &&
          !document.hidden && // Don't observe when tab not visible
          mutations.some(m => m.type === 'childList' && m.addedNodes.length > 0)) { // Only on actual content changes
        this.debouncedRetranslate();
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: false // Disable character data observation for performance
    });
  }

  private debouncedRetranslate() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    // PERFORMANCE FIX: Dramatically reduce translation frequency
    this.debounceTimer = window.setTimeout(() => {
      // Enhanced blocking conditions
      if (this.isTranslating || 
          document.getElementById('translation-freeze-styles') ||
          document.body.style.overflow === 'hidden' ||
          document.hidden || // Don't translate when tab not visible
          window.location.pathname !== this.lastTranslatedPath) { // Don't translate if page changed
        console.log('⏳ Translation blocked to prevent floating');
        return;
      }
      
      // Only use cached translations for dynamic updates to prevent API calls
      this.translateCachedContent(this.currentLanguage);
      
    }, 3000); // Increased to 3 seconds to reduce frequency
  }

  async translateAll(targetLang: Language) {
    // Cancel any ongoing translation
    if (this.abortController) {
      this.abortController.abort();
    }
    
    // Prevent rapid language switching that causes floating
    if (this.isTranslating) {
      console.log('⏳ Translation in progress, waiting...');
      return;
    }
    
    if (targetLang === 'en') {
      this.restoreOriginalLanguage();
      return;
    }

    this.currentLanguage = targetLang;
    this.lastTranslatedPath = window.location.pathname;
    this.abortController = new AbortController();
    
    // ANTI-FLICKER: Store scroll position before translation
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // STEP 1: Load global cache from Supabase first
    await this.loadGlobalCache(targetLang);
    
    // STEP 2: Apply all cached translations immediately
    this.translateCachedContent(targetLang);
    
    // STEP 3: Restore scroll position to prevent jump
    setTimeout(() => {
      window.scrollTo(0, scrollTop);
    }, 50);
    
    // STEP 4: Only translate truly new content
    const uncachedTexts = this.collectUncachedTexts(targetLang);
    if (uncachedTexts.length > 0) {
      console.log(`💰 Translating ${uncachedTexts.length} new texts (shared globally)`);
      setTimeout(() => this.translateNewContent(uncachedTexts, targetLang), 100);
    } else {
      console.log('✅ All content from global cache - instant results!');
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

  private async loadGlobalCache(targetLang: Language) {
    try {
      // Import supabase client dynamically to avoid issues
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from('translation_cache')
        .select('original, translated')
        .eq('target_lang', targetLang)
        .limit(1000); // Get most common translations
      
      if (error) {
        console.error('Failed to load global cache:', error);
        return;
      }
      
      if (data) {
        let loadedCount = 0;
        data.forEach(row => {
          if (!this.cache[row.original]) {
            this.cache[row.original] = {};
          }
          this.cache[row.original][targetLang] = row.translated;
          loadedCount++;
        });
        
        console.log(`🌍 Loaded ${loadedCount} translations from global cache`);
        this.saveCache(); // Save to localStorage for offline access
      }
    } catch (error) {
      console.error('Failed to load global translation cache:', error);
    }
  }

  private setupRealtimeSync() {
    // Set up realtime sync for new translations
    this.syncNewTranslations();
  }

  private async syncNewTranslations() {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Listen for new translations added by other users
      const channel = supabase
        .channel('translation-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'translation_cache'
          },
          (payload) => {
            console.log('🔄 New translation received:', payload.new);
            const { original, target_lang, translated } = payload.new as any;
            
            // Add to local cache
            if (!this.cache[original]) {
              this.cache[original] = {};
            }
            this.cache[original][target_lang] = translated;
            
            // OPTIMIZED: Prevent real-time updates from causing page blinking
            if (target_lang === this.currentLanguage && !this.isTranslating && !document.getElementById('translation-freeze-styles')) {
              // Temporarily disable mutation observer to prevent loop
              const wasObserving = !!this.observer;
              if (wasObserving) {
                this.observer?.disconnect();
              }
              
              // Apply translation
              this.translateCachedContent(target_lang);
              
              // Re-enable mutation observer after a delay
              if (wasObserving) {
                setTimeout(() => {
                  this.setupMutationObserver();
                }, 100);
              }
            }
            
            this.saveCache();
          }
        )
        .subscribe();
        
      console.log('🔄 Real-time translation sync enabled');
    } catch (error) {
      console.error('Failed to setup realtime sync:', error);
    }
  }

  private translateCachedContent(targetLang: Language) {
    // Set translation flag immediately to prevent conflicts
    this.isTranslating = true;
    
    // Disconnect mutation observer during translation
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Translate document title first
    const originalTitle = document.title;
    const translatedTitle = this.cache[originalTitle]?.[targetLang];
    if (translatedTitle && translatedTitle !== originalTitle) {
      document.title = translatedTitle;
    }

    // Collect all text nodes to translate
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

    // Batch all text replacements in one operation
    textNodesToTranslate.forEach(textNode => {
      const originalText = textNode.textContent?.trim();
      if (!originalText) return;

      const translation = this.cache[originalText]?.[targetLang];
      if (translation && translation !== originalText) {
        console.log(`🔄 Replacing "${originalText}" → "${translation}"`);
        textNode.textContent = translation;
      }
    });

    // Translate attributes and data-i18n elements
    this.translateAttributes(targetLang);
    this.translateDataI18nElements(targetLang);
    
    // Re-enable mutation observer after translation
    setTimeout(() => {
      this.isTranslating = false;
      this.setupMutationObserver();
    }, 100);
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

  private translateDataI18nElements(targetLang: Language) {
    // Handle elements with data-i18n attribute (like nav items)
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (!key) return;
      
      const translation = this.cache[key]?.[targetLang];
      if (translation && translation !== key) {
        console.log(`🔄 Translating nav item "${key}" → "${translation}"`);
        element.textContent = translation;
      }
    });
  }

  private collectUncachedTexts(targetLang: Language): string[] {
    const uncachedTexts: string[] = [];
    const seenTexts = new Set<string>();

    // More aggressive filtering to reduce API calls
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
          // More aggressive filtering - 5+ chars and meaningful content
          return (text && text.length >= 5 && !/^[\d\s\.,\-\+\(\)\[\]%$€£¥]+$/.test(text)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      }
    );

    let node;
    while ((node = walker.nextNode()) && uncachedTexts.length < 30) { // Limit to 30 items max
      const text = node.textContent?.trim();
      if (text && !seenTexts.has(text) && !this.cache[text]?.[targetLang]) {
        // Super strict filtering to reduce API costs
        if (!/^[\d\s\.,\-\+\(\)\[\]%$€£¥]*$/.test(text) && // Skip pure numbers/symbols
            !/^https?:\/\//.test(text) && // Skip URLs
            !/^[^\s]+@[^\s]+\.[^\s]+$/.test(text) && // Skip emails
            !/^[\/\\]/.test(text) && // Skip file paths
            !/^[A-Z]{2,}$/.test(text) && // Skip pure uppercase abbreviations
            text.length >= 5 && // Minimum length increased
            text.length <= 200) { // Shorter maximum length
          seenTexts.add(text);
          uncachedTexts.push(text);
        }
      }
    }

    return uncachedTexts;
  }

  private async translateNewContent(texts: string[], targetLang: Language) {
    const batchSize = 20; // Smaller batches for faster response
    
    const batchPromises = [];
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      batchPromises.push(this.translateBatch(batch, targetLang));
      
      // Add delay between batches to prevent overwhelming the API
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    await Promise.allSettled(batchPromises);
    
    // Apply newly translated content immediately
    this.translateCachedContent(targetLang);
    
    // Save to global cache in background (non-blocking)
    this.saveToGlobalCacheBackground(targetLang);
  }

  private async saveToGlobalCacheBackground(targetLang: Language) {
    // Use setTimeout to make this non-blocking
    setTimeout(async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        
        // Get only new translations for this language
        const translations = Object.entries(this.cache)
          .filter(([_, translations]) => translations[targetLang])
          .slice(-50) // Only save the last 50 to reduce payload
          .map(([original, translations]) => ({
            original,
            target_lang: targetLang,
            translated: translations[targetLang]
          }));
        
        if (translations.length > 0) {
          // Upsert to global cache in smaller chunks
          const chunkSize = 25;
          for (let i = 0; i < translations.length; i += chunkSize) {
            const chunk = translations.slice(i, i + chunkSize);
            await supabase
              .from('translation_cache')
              .upsert(chunk, { onConflict: 'original,target_lang' });
            
            // Small delay between chunks
            if (i + chunkSize < translations.length) {
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
          
          console.log(`🌍 Saved ${translations.length} translations to global cache (background)`);
        }
      } catch (error) {
        console.error('Background save to global cache failed:', error);
      }
    }, 500); // Delay to ensure UI responsiveness
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

  // Hook methods for external integration - WORKS FOR ALL PAGES
  onLanguageChange(newLanguage: Language) {
    console.log(`🌐 Language changed to: ${newLanguage} - Applying to ALL pages`);
    this.translateAll(newLanguage);
  }

  onRouteChange(newPath: string) {
    console.log(`🌐 Route changed → ${newPath} - Re-translating for current language: ${this.currentLanguage}`);
    if (this.currentLanguage !== 'en') {
      // Ensure translation works on ALL pages with anti-floating protection
      setTimeout(() => {
        this.translateAllContent(this.currentLanguage);
      }, 100); // Optimized timing for all pages
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