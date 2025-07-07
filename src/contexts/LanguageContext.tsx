import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

export type Language = 'en' | 'hy' | 'ru' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation dictionaries - ALL LANGUAGES SUPPORTED
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.programs': 'Programs',
    'nav.business': 'Business',
    'nav.memeCoins': 'Meme Coins',
    'nav.visual': 'Visual',
    'nav.translator': 'Translator',
    'nav.community': 'Community',
    'nav.pricing': 'Pricing',
    'nav.settings': 'Settings',
    'nav.signOut': 'Sign Out',
    'nav.getStarted': 'Get Started',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back, Thinker!',
    'dashboard.subtitle': 'Continue building your unique mind',
    'dashboard.dayStreak': 'Day Streak',
    'dashboard.exploreModels': 'Explore Models',
    'dashboard.mentalModels': 'Mental Models',
    'dashboard.learningHours': 'Learning Hours',
    'dashboard.streakDays': 'Streak Days',
    'dashboard.weeklyGoal': 'Weekly Goal',
    'dashboard.thisMonth': 'this month',
    'dashboard.currentStreak': 'current streak',
    'dashboard.almostThere': 'almost there!',
    'dashboard.available': 'available',
    
    // Common
    'common.loading': 'Loading...',
    'common.signIn': 'Sign In',
    'common.signUp': 'Sign Up',
    'common.models': 'Models',
    'common.of': 'of',
  },
  
  hy: {
    // Navigation
    'nav.home': 'Գլխավոր',
    'nav.programs': 'Ծրագրեր',
    'nav.business': 'Բիզնես',
    'nav.memeCoins': 'Մեմ Մետաղադրամներ',
    'nav.visual': 'Տեսական',
    'nav.translator': 'Թարգմանիչ',
    'nav.community': 'Համայնք',
    'nav.pricing': 'Գների',
    'nav.settings': 'Կարգավորումներ',
    'nav.signOut': 'Դուրս գալ',
    'nav.getStarted': 'Սկսել',
    
    // Dashboard
    'dashboard.welcome': 'Բարի վերադարձ, Մտածող!',
    'dashboard.subtitle': 'Շարունակիր զարգացնել քո եզակի միտքը',
    'dashboard.dayStreak': 'Օրվա շարք',
    'dashboard.exploreModels': 'Ուսումնասիրել մոդելները',
    'dashboard.mentalModels': 'Մտական մոդելներ',
    'dashboard.learningHours': 'Ուսուցման ժամեր',
    'dashboard.streakDays': 'Շարունակական օրեր',
    'dashboard.weeklyGoal': 'Շաբաթական նպատակ',
    'dashboard.thisMonth': 'այս ամիս',
    'dashboard.currentStreak': 'ընթացիկ շարք',
    'dashboard.almostThere': 'գրեթե այնտեղ!',
    'dashboard.available': 'հասանելի',
    
    // Common
    'common.loading': 'Բեռնվում է...',
    'common.signIn': 'Մուտք գործել',
    'common.signUp': 'Գրանցվել',
    'common.models': 'Մոդելներ',
    'common.of': '-ից',
  },
  
  ru: {
    // Navigation
    'nav.home': 'Главная',
    'nav.programs': 'Программы',
    'nav.business': 'Бизнес',
    'nav.memeCoins': 'Мем-монеты',
    'nav.visual': 'Визуальное',
    'nav.translator': 'Переводчик',
    'nav.community': 'Сообщество',
    'nav.pricing': 'Цены',
    'nav.settings': 'Настройки',
    'nav.signOut': 'Выйти',
    'nav.getStarted': 'Начать',
    
    // Dashboard
    'dashboard.welcome': 'Добро пожаловать, Мыслитель!',
    'dashboard.subtitle': 'Продолжай развивать свой уникальный разум',
    'dashboard.dayStreak': 'Дневная серия',
    'dashboard.exploreModels': 'Исследовать модели',
    'dashboard.mentalModels': 'Ментальные модели',
    'dashboard.learningHours': 'Часы обучения',
    'dashboard.streakDays': 'Дни подряд',
    'dashboard.weeklyGoal': 'Недельная цель',
    'dashboard.thisMonth': 'в этом месяце',
    'dashboard.currentStreak': 'текущая серия',
    'dashboard.almostThere': 'почти готово!',
    'dashboard.available': 'доступно',
    
    // Common
    'common.loading': 'Загрузка...',
    'common.signIn': 'Войти',
    'common.signUp': 'Регистрация',
    'common.models': 'Модели',
    'common.of': 'из',
  },

  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.programs': 'Programas',
    'nav.business': 'Negocio',
    'nav.memeCoins': 'Meme Coins',
    'nav.visual': 'Visual',
    'nav.translator': 'Traductor',
    'nav.community': 'Comunidad',
    'nav.pricing': 'Precios',
    'nav.settings': 'Configuración',
    'nav.signOut': 'Cerrar Sesión',
    'nav.getStarted': 'Empezar',
    
    // Dashboard
    'dashboard.welcome': '¡Bienvenido de vuelta, Pensador!',
    'dashboard.subtitle': 'Continúa construyendo tu mente única',
    'dashboard.dayStreak': 'Racha Diaria',
    'dashboard.exploreModels': 'Explorar Modelos',
    'dashboard.mentalModels': 'Modelos Mentales',
    'dashboard.learningHours': 'Horas de Aprendizaje',
    'dashboard.streakDays': 'Días Consecutivos',
    'dashboard.weeklyGoal': 'Meta Semanal',
    'dashboard.thisMonth': 'este mes',
    'dashboard.currentStreak': 'racha actual',
    'dashboard.almostThere': '¡casi llegamos!',
    'dashboard.available': 'disponible',
    
    // Common
    'common.loading': 'Cargando...',
    'common.signIn': 'Iniciar Sesión',
    'common.signUp': 'Registrarse',
    'common.models': 'Modelos',
    'common.of': 'de',
  },

  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.programs': 'Programmes',
    'nav.business': 'Affaires',
    'nav.memeCoins': 'Meme Coins',
    'nav.visual': 'Visuel',
    'nav.translator': 'Traducteur',
    'nav.community': 'Communauté',
    'nav.pricing': 'Tarifs',
    'nav.settings': 'Paramètres',
    'nav.signOut': 'Déconnexion',
    'nav.getStarted': 'Commencer',
    
    // Dashboard
    'dashboard.welcome': 'Bon retour, Penseur!',
    'dashboard.subtitle': 'Continue à développer ton esprit unique',
    'dashboard.dayStreak': 'Série Quotidienne',
    'dashboard.exploreModels': 'Explorer les Modèles',
    'dashboard.mentalModels': 'Modèles Mentaux',
    'dashboard.learningHours': 'Heures d\'Apprentissage',
    'dashboard.streakDays': 'Jours Consécutifs',
    'dashboard.weeklyGoal': 'Objectif Hebdomadaire',
    'dashboard.thisMonth': 'ce mois',
    'dashboard.currentStreak': 'série actuelle',
    'dashboard.almostThere': 'presque là!',
    'dashboard.available': 'disponible',
    
    // Common
    'common.loading': 'Chargement...',
    'common.signIn': 'Connexion',
    'common.signUp': 'S\'inscrire',
    'common.models': 'Modèles',
    'common.of': 'de',
  },

  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.programs': 'Programme',
    'nav.business': 'Business',
    'nav.memeCoins': 'Meme Coins',
    'nav.visual': 'Visuell',
    'nav.translator': 'Übersetzer',
    'nav.community': 'Gemeinschaft',
    'nav.pricing': 'Preise',
    'nav.settings': 'Einstellungen',
    'nav.signOut': 'Abmelden',
    'nav.getStarted': 'Loslegen',
    
    // Dashboard
    'dashboard.welcome': 'Willkommen zurück, Denker!',
    'dashboard.subtitle': 'Entwickle weiterhin deinen einzigartigen Geist',
    'dashboard.dayStreak': 'Tages-Serie',
    'dashboard.exploreModels': 'Modelle Erkunden',
    'dashboard.mentalModels': 'Mentale Modelle',
    'dashboard.learningHours': 'Lernstunden',
    'dashboard.streakDays': 'Aufeinanderfolgende Tage',
    'dashboard.weeklyGoal': 'Wochenziel',
    'dashboard.thisMonth': 'diesen Monat',
    'dashboard.currentStreak': 'aktuelle Serie',
    'dashboard.almostThere': 'fast geschafft!',
    'dashboard.available': 'verfügbar',
    
    // Common
    'common.loading': 'Laden...',
    'common.signIn': 'Anmelden',
    'common.signUp': 'Registrieren',
    'common.models': 'Modelle',
    'common.of': 'von',
  },

  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.programs': '程序',
    'nav.business': '商业',
    'nav.memeCoins': '模因币',
    'nav.visual': '视觉',
    'nav.translator': '翻译器',
    'nav.community': '社区',
    'nav.pricing': '价格',
    'nav.settings': '设置',
    'nav.signOut': '退出登录',
    'nav.getStarted': '开始',
    
    // Dashboard
    'dashboard.welcome': '欢迎回来，思考者！',
    'dashboard.subtitle': '继续构建你独特的思维',
    'dashboard.dayStreak': '每日连击',
    'dashboard.exploreModels': '探索模型',
    'dashboard.mentalModels': '心理模型',
    'dashboard.learningHours': '学习时间',
    'dashboard.streakDays': '连续天数',
    'dashboard.weeklyGoal': '每周目标',
    'dashboard.thisMonth': '本月',
    'dashboard.currentStreak': '当前连击',
    'dashboard.almostThere': '快到了！',
    'dashboard.available': '可用',
    
    // Common
    'common.loading': '加载中...',
    'common.signIn': '登录',
    'common.signUp': '注册',
    'common.models': '模型',
    'common.of': '的',
  },

  ja: {
    // Navigation
    'nav.home': 'ホーム',
    'nav.programs': 'プログラム',
    'nav.business': 'ビジネス',
    'nav.memeCoins': 'ミームコイン',
    'nav.visual': 'ビジュアル',
    'nav.translator': '翻訳者',
    'nav.community': 'コミュニティ',
    'nav.pricing': '価格',
    'nav.settings': '設定',
    'nav.signOut': 'ログアウト',
    'nav.getStarted': '始める',
    
    // Dashboard
    'dashboard.welcome': 'おかえりなさい、思考者！',
    'dashboard.subtitle': 'あなたのユニークな心を育て続けましょう',
    'dashboard.dayStreak': '連続日数',
    'dashboard.exploreModels': 'モデルを探索',
    'dashboard.mentalModels': 'メンタルモデル',
    'dashboard.learningHours': '学習時間',
    'dashboard.streakDays': '連続日数',
    'dashboard.weeklyGoal': '週間目標',
    'dashboard.thisMonth': '今月',
    'dashboard.currentStreak': '現在の連続記録',
    'dashboard.almostThere': 'もう少し！',
    'dashboard.available': '利用可能',
    
    // Common
    'common.loading': '読み込み中...',
    'common.signIn': 'ログイン',
    'common.signUp': '登録',
    'common.models': 'モデル',
    'common.of': 'の',
  },

  ko: {
    // Navigation
    'nav.home': '홈',
    'nav.programs': '프로그램',
    'nav.business': '비즈니스',
    'nav.memeCoins': '밈 코인',
    'nav.visual': '비주얼',
    'nav.translator': '번역기',
    'nav.community': '커뮤니티',
    'nav.pricing': '가격',
    'nav.settings': '설정',
    'nav.signOut': '로그아웃',
    'nav.getStarted': '시작하기',
    
    // Dashboard
    'dashboard.welcome': '돌아오신 것을 환영합니다, 사상가!',
    'dashboard.subtitle': '당신만의 독특한 마음을 계속 키워나가세요',
    'dashboard.dayStreak': '일일 연속 기록',
    'dashboard.exploreModels': '모델 탐색',
    'dashboard.mentalModels': '멘탈 모델',
    'dashboard.learningHours': '학습 시간',
    'dashboard.streakDays': '연속 일수',
    'dashboard.weeklyGoal': '주간 목표',
    'dashboard.thisMonth': '이번 달',
    'dashboard.currentStreak': '현재 연속 기록',
    'dashboard.almostThere': '거의 다 왔어요!',
    'dashboard.available': '사용 가능',
    
    // Common
    'common.loading': '로딩 중...',
    'common.signIn': '로그인',
    'common.signUp': '회원가입',
    'common.models': '모델',
    'common.of': '의',
  },

  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.programs': 'البرامج',
    'nav.business': 'الأعمال',
    'nav.memeCoins': 'عملات الميم',
    'nav.visual': 'بصري',
    'nav.translator': 'المترجم',
    'nav.community': 'المجتمع',
    'nav.pricing': 'التسعير',
    'nav.settings': 'الإعدادات',
    'nav.signOut': 'تسجيل الخروج',
    'nav.getStarted': 'ابدأ',
    
    // Dashboard
    'dashboard.welcome': 'مرحباً بعودتك، أيها المفكر!',
    'dashboard.subtitle': 'استمر في بناء عقلك الفريد',
    'dashboard.dayStreak': 'السلسلة اليومية',
    'dashboard.exploreModels': 'استكشاف النماذج',
    'dashboard.mentalModels': 'النماذج الذهنية',
    'dashboard.learningHours': 'ساعات التعلم',
    'dashboard.streakDays': 'الأيام المتتالية',
    'dashboard.weeklyGoal': 'الهدف الأسبوعي',
    'dashboard.thisMonth': 'هذا الشهر',
    'dashboard.currentStreak': 'السلسلة الحالية',
    'dashboard.almostThere': 'تقريباً هناك!',
    'dashboard.available': 'متاح',
    
    // Common
    'common.loading': 'جار التحميل...',
    'common.signIn': 'تسجيل الدخول',
    'common.signUp': 'إنشاء حساب',
    'common.models': 'النماذج',
    'common.of': 'من',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isTranslating, setIsTranslating] = useState(false);

  // Load language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    const validLanguages = ['en', 'hy', 'ru', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ar'];
    if (savedLanguage && validLanguages.includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0] as Language;
      if (validLanguages.includes(browserLang)) {
        setLanguageState(browserLang);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // OPTIMISTIC UPDATE: Don't trigger auto-translation here
    // Let AutoTranslateProvider handle it to prevent conflicts
    
    // TODO: Save language preference to user profile when available
  };

  // REMOVED: Auto-translation functions moved to useDebouncedLanguageSwitch
  // This prevents conflicts between multiple translation systems

  const t = (key: string): string => {
    // For new languages without translations, return the key as fallback
    const currentTranslations = translations[language];
    if (!currentTranslations) {
      return key;
    }
    return currentTranslations[key as keyof typeof currentTranslations] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
};