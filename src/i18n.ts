import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from '../locales/en/common.json';
import enNav from '../locales/en/nav.json';
import ruCommon from '../locales/ru/common.json';
import ruNav from '../locales/ru/nav.json';
import frCommon from '../locales/fr/common.json';
import frNav from '../locales/fr/nav.json';
import deCommon from '../locales/de/common.json';
import deNav from '../locales/de/nav.json';
import esNav from '../locales/es/nav.json';
import hyNav from '../locales/hy/nav.json';
import jaNav from '../locales/ja/nav.json';
import koNav from '../locales/ko/nav.json';
import zhNav from '../locales/zh/nav.json';

const resources = {
  en: {
    common: enCommon,
    nav: enNav,
    hero: {
      title: "Master Business",
      subtitle: "Join {{count}}+ professionals who mastered business fundamentals through our revolutionary visual learning system",
      cta: "Start Your Journey FREE",
      watchStories: "Watch Success Stories",
      features: {
        visualLearning: "100% Visual Learning",
        quickLessons: "5-Minute Lessons", 
        gamified: "Gamified Experience",
        progress: "Progress Tracking",
        community: "Expert Community",
        lifetime: "Lifetime Access"
      }
    }
  },
  ru: {
    common: ruCommon,
    nav: ruNav,
    hero: {
      title: "Овладейте Бизнесом",
      subtitle: "Присоединяйтесь к {{count}}+ профессионалам, которые освоили основы бизнеса через нашу революционную систему визуального обучения",
      cta: "Начните Свой Путь БЕСПЛАТНО",
      watchStories: "Смотреть Истории Успеха",
      features: {
        visualLearning: "100% Визуальное Обучение",
        quickLessons: "5-минутные Уроки",
        gamified: "Игровой Опыт",
        progress: "Отслеживание Прогресса", 
        community: "Сообщество Экспертов",
        lifetime: "Пожизненный Доступ"
      }
    }
  },
  hy: {
    common: {},
    nav: hyNav,
    hero: {
      title: "Տիրապետել Բիզնեսին",
      subtitle: "Միացեք {{count}}+ մասնագետներին, ովքեր տիրապետել են բիզնեսի հիմունքներին մեր հեղափոխական վիզուալ ուսուցման համակարգի միջոցով",
      cta: "Սկսեք Ձեր Ճանապարհը ԱՆՎՃԱՐ",
      watchStories: "Դիտել Հաջողության Պատմությունները",
      features: {
        visualLearning: "100% Վիզուալ Ուսուցում",
        quickLessons: "5-րոպեանոց Դասեր",
        gamified: "Խաղային Փորձառություն",
        progress: "Առաջընթացի Հետևում",
        community: "Փորձագետների Համայնք",
        lifetime: "Կյանքի Համար Մուտք"
      }
    }
  },
  fr: {
    common: frCommon,
    nav: frNav,
    hero: {
      title: "Maîtriser les Affaires",
      subtitle: "Rejoignez {{count}}+ professionnels qui ont maîtrisé les fondamentaux du business grâce à notre système d'apprentissage visuel révolutionnaire",
      cta: "Commencez Votre Parcours GRATUITEMENT",
      watchStories: "Voir les Histoires de Succès",
      features: {
        visualLearning: "100% Apprentissage Visuel",
        quickLessons: "Leçons de 5 Minutes",
        gamified: "Expérience Gamifiée",
        progress: "Suivi des Progrès",
        community: "Communauté d'Experts",
        lifetime: "Accès à Vie"
      }
    }
  },
  de: {
    common: deCommon,
    nav: deNav,
    hero: {
      title: "Business Meistern",
      subtitle: "Schließen Sie sich {{count}}+ Fachleuten an, die Geschäftsgrundlagen durch unser revolutionäres visuelles Lernsystem gemeistert haben",
      cta: "Starten Sie Ihre Reise KOSTENLOS",
      watchStories: "Erfolgsgeschichten Ansehen",
      features: {
        visualLearning: "100% Visuelles Lernen",
        quickLessons: "5-Minuten-Lektionen",
        gamified: "Spielerische Erfahrung",
        progress: "Fortschrittsverfolgung",
        community: "Experten-Community",
        lifetime: "Lebenslanger Zugang"
      }
    }
  },
  es: {
    common: {},
    nav: esNav,
    hero: {
      title: "Dominar los Negocios",
      subtitle: "Únete a {{count}}+ profesionales que dominaron los fundamentos empresariales a través de nuestro revolucionario sistema de aprendizaje visual",
      cta: "Comienza Tu Viaje GRATIS",
      watchStories: "Ver Historias de Éxito",
      features: {
        visualLearning: "100% Aprendizaje Visual",
        quickLessons: "Lecciones de 5 Minutos",
        gamified: "Experiencia Gamificada",
        progress: "Seguimiento del Progreso",
        community: "Comunidad de Expertos",
        lifetime: "Acceso de Por Vida"
      }
    }
  },
  ja: {
    common: {},
    nav: jaNav,
    hero: {
      title: "ビジネスをマスター",
      subtitle: "革新的なビジュアル学習システムを通じてビジネスの基礎をマスターした{{count}}+の専門家に参加しましょう",
      cta: "無料で旅を始める",
      watchStories: "成功事例を見る",
      features: {
        visualLearning: "100%ビジュアル学習",
        quickLessons: "5分間のレッスン",
        gamified: "ゲーミフィケーション体験",
        progress: "進捗追跡",
        community: "エキスパートコミュニティ",
        lifetime: "生涯アクセス"
      }
    }
  },
  ko: {
    common: {},
    nav: koNav,
    hero: {
      title: "비즈니스 마스터",
      subtitle: "혁신적인 시각적 학습 시스템을 통해 비즈니스 기초를 마스터한 {{count}}+ 전문가들과 함께하세요",
      cta: "무료로 여정 시작하기",
      watchStories: "성공 스토리 보기",
      features: {
        visualLearning: "100% 시각적 학습",
        quickLessons: "5분 레슨",
        gamified: "게임화된 경험",
        progress: "진행 상황 추적",
        community: "전문가 커뮤니티",
        lifetime: "평생 액세스"
      }
    }
  },
  zh: {
    common: {},
    nav: zhNav,
    hero: {
      title: "掌握商业",
      subtitle: "加入{{count}}+位通过我们革命性视觉学习系统掌握商业基础的专业人士",
      cta: "免费开始您的旅程",
      watchStories: "观看成功故事",
      features: {
        visualLearning: "100%视觉学习",
        quickLessons: "5分钟课程",
        gamified: "游戏化体验",
        progress: "进度跟踪",
        community: "专家社区",
        lifetime: "终身访问"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    defaultNS: 'common',
    ns: ['common', 'nav', 'hero'],

    // Ensure ready state is properly managed
    react: {
      useSuspense: false, // We'll handle loading states manually
    }
  });

export default i18n;