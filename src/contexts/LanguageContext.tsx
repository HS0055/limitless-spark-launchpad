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

// Translation dictionaries
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
    
    // Leagues
    'leagues.title': 'Learning Leagues',
    'leagues.viewAll': 'View All Programs',
    'leagues.beginner': 'Beginner League',
    'leagues.advanced': 'Advanced League',
    'leagues.elite': 'Elite League',
    'leagues.foundation': 'Foundation Building',
    'leagues.strategic': 'Strategic Mastery',
    'leagues.innovation': 'Innovation & Leadership',
    'leagues.participants': 'participants',
    
    // Mental Models
    'models.yourModels': 'Your Mental Models',
    'models.browseAll': 'Browse All',
    'models.mastered': 'Mastered',
    'models.inProgress': 'In Progress',
    'models.continue': 'Continue',
    'models.review': 'Review',
    'models.progress': 'Progress',
    'models.lessons': 'lessons',
    
    // Achievements
    'achievements.nextGoal': 'Next Goal',
    'achievements.recent': 'Recent Achievements',
    'achievements.quickActions': 'Quick Actions',
    'achievements.browsePrograms': 'Browse Programs',
    'achievements.joinCommunity': 'Join Community',
    'achievements.setGoals': 'Set Goals',
    
    // Hero Section
    'hero.badge': '🏆 Business Fundamentals League',
    'hero.title': 'Master business skills with',
    'hero.company': 'TopOne Academy',
    'hero.subtitle': 'Join the Business Fundamentals League and gain confidence through',
    'hero.visualLearning': 'visual learning',
    'hero.description': 'Transform your business skills with bite-sized visual lessons designed to make complex concepts simple and actionable.',
    'hero.joinLeague': '🚀 Join Business League',
    'hero.watchPreview': 'Watch Preview',
    
    // Stats
    'stats.leagues': 'Learning Leagues',
    'stats.learners': 'Active Learners',
    'stats.rating': 'Average Rating',
    'stats.lessonLength': 'Lesson Length',
    
    // Benefits
    'benefits.visual': 'Visual Learning - No boring theory',
    'benefits.lessons': 'Minute Lessons - Perfect for busy schedules',
    'benefits.gamified': 'Gamified Experience - Unlock achievements',
    'benefits.tracking': 'Progress Tracking - See your growth',
    'benefits.community': 'Community Access - Learn with peers',
    'benefits.mobile': 'Mobile Optimized - Learn anywhere',
    
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
    
    // Leagues
    'leagues.title': 'Ուսուցման լիգաներ',
    'leagues.viewAll': 'Տեսնել բոլոր ծրագրերը',
    'leagues.beginner': 'Սկսնակների լիգա',
    'leagues.advanced': 'Առաջադեմ լիգա',
    'leagues.elite': 'Էլիտար լիգա',
    'leagues.foundation': 'Հիմքերի կառուցում',
    'leagues.strategic': 'Ռազմավարական տիրապետում',
    'leagues.innovation': 'Նորարարություն և առաջնորդություն',
    'leagues.participants': 'մասնակիցներ',
    
    // Mental Models
    'models.yourModels': 'Ձեր մտական մոդելները',
    'models.browseAll': 'Դիտել բոլորը',
    'models.mastered': 'Տիրապետված',
    'models.inProgress': 'Գործընթացում',
    'models.continue': 'Շարունակել',
    'models.review': 'Վերանայել',
    'models.progress': 'Առաջընթաց',
    'models.lessons': 'դասեր',
    
    // Achievements
    'achievements.nextGoal': 'Հաջորդ նպատակ',
    'achievements.recent': 'Վերջին ձեռքբերումներ',
    'achievements.quickActions': 'Արագ գործողություններ',
    'achievements.browsePrograms': 'Դիտել ծրագրերը',
    'achievements.joinCommunity': 'Միանալ համայնքին',
    'achievements.setGoals': 'Սահմանել նպատակներ',
    
    // Hero Section
    'hero.badge': '🏆 Բիզնես հիմունքների լիգա',
    'hero.title': 'Տիրապետիր բիզնես հմտություններին',
    'hero.company': 'TopOne ակադեմիա',
    'hero.subtitle': 'Միացիր Բիզնես հիմունքների լիգային և ձեռք բեր վստահություն',
    'hero.visualLearning': 'տեսարան ուսուցման միջոցով',
    'hero.description': 'Փոխակերպիր քո բիզնես հմտությունները կոճ-չափ տեսարան դասերով, որոնք նախագծված են բարդ հասկացությունները պարզ և գործնական դարձնելու համար:',
    'hero.joinLeague': '🚀 Միանալ բիզնես լիգային',
    'hero.watchPreview': 'Դիտել նախադիտումը',
    
    // Stats
    'stats.leagues': 'Ուսուցման լիգաներ',
    'stats.learners': 'Ակտիվ ուսանողներ',
    'stats.rating': 'Միջին գնահատական',
    'stats.lessonLength': 'Դասի տևությունը',
    
    // Benefits
    'benefits.visual': 'Տեսարան ուսուցում - Ոչ ձանձրալի տեսություն',
    'benefits.lessons': 'Րոպեանոց դասեր - Կատարյալ է զբաղված ժամանակացույցի համար',
    'benefits.gamified': 'Խաղակրական փորձ - Բացահայտեք ձեռքբերումներ',
    'benefits.tracking': 'Առաջընթացի հետևում - Տեսեք ձեր աճը',
    'benefits.community': 'Համայնքի մուտք - Սովորեք հասակակիցների հետ',
    'benefits.mobile': 'Բջջային օպտիմիզացված - Սովորեք ցանկացած վայրում',
    
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
    
    // Leagues
    'leagues.title': 'Лиги обучения',
    'leagues.viewAll': 'Посмотреть все программы',
    'leagues.beginner': 'Лига новичков',
    'leagues.advanced': 'Продвинутая лига',
    'leagues.elite': 'Элитная лига',
    'leagues.foundation': 'Построение основ',
    'leagues.strategic': 'Стратегическое мастерство',
    'leagues.innovation': 'Инновации и лидерство',
    'leagues.participants': 'участников',
    
    // Mental Models
    'models.yourModels': 'Ваши ментальные модели',
    'models.browseAll': 'Просмотреть все',
    'models.mastered': 'Освоено',
    'models.inProgress': 'В прогрессе',
    'models.continue': 'Продолжить',
    'models.review': 'Повторить',
    'models.progress': 'Прогресс',
    'models.lessons': 'уроков',
    
    // Achievements
    'achievements.nextGoal': 'Следующая цель',
    'achievements.recent': 'Недавние достижения',
    'achievements.quickActions': 'Быстрые действия',
    'achievements.browsePrograms': 'Просмотреть программы',
    'achievements.joinCommunity': 'Присоединиться к сообществу',
    'achievements.setGoals': 'Установить цели',
    
    // Hero Section
    'hero.badge': '🏆 Лига основ бизнеса',
    'hero.title': 'Овладей навыками бизнеса с',
    'hero.company': 'TopOne Академия',
    'hero.subtitle': 'Присоединяйся к Лиге основ бизнеса и обретай уверенность через',
    'hero.visualLearning': 'визуальное обучение',
    'hero.description': 'Трансформируй свои бизнес-навыки с помощью коротких визуальных уроков, разработанных для того, чтобы сделать сложные концепции простыми и применимыми.',
    'hero.joinLeague': '🚀 Присоединиться к бизнес-лиге',
    'hero.watchPreview': 'Смотреть превью',
    
    // Stats
    'stats.leagues': 'Лиги обучения',
    'stats.learners': 'Активные ученики',
    'stats.rating': 'Средний рейтинг',
    'stats.lessonLength': 'Длительность урока',
    
    // Benefits
    'benefits.visual': 'Визуальное обучение - Никакой скучной теории',
    'benefits.lessons': 'Минутные уроки - Идеально для плотного расписания',
    'benefits.gamified': 'Игровой опыт - Открывайте достижения',
    'benefits.tracking': 'Отслеживание прогресса - Видите свой рост',
    'benefits.community': 'Доступ к сообществу - Учитесь со сверстниками',
    'benefits.mobile': 'Мобильная оптимизация - Учитесь где угодно',
    
    // Common
    'common.loading': 'Загрузка...',
    'common.signIn': 'Войти',
    'common.signUp': 'Регистрация',
    'common.models': 'Модели',
    'common.of': 'из',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const { user } = useAuth();
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
    
    // Trigger auto-translation
    if (lang !== 'en') {
      triggerAutoTranslation(lang);
    } else {
      restoreOriginalContent();
    }
    
    // If user is logged in, save preference to profile
    if (user) {
      console.log('TODO: Save language preference to user profile');
    }
  };

  const triggerAutoTranslation = async (targetLang: Language) => {
    setIsTranslating(true);
    try {
      const { translationEngine } = await import('@/lib/translationEngine');
      await translationEngine.translateAll(targetLang);
    } catch (error) {
      console.error('Failed to trigger auto-translation:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const restoreOriginalContent = () => {
    import('@/lib/translationEngine').then(({ translationEngine }) => {
      translationEngine.translateAll('en');
    });
    setIsTranslating(false);
  };

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