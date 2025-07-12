import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import locale resources
import enCommon from '../locales/en/common.json';
import enNav from '../locales/en/nav.json';
import enHero from '../locales/en/hero.json';

import ruCommon from '../locales/ru/common.json';
import ruNav from '../locales/ru/nav.json';
import ruHero from '../locales/ru/hero.json';

import hyCommon from '../locales/hy/common.json';
import hyNav from '../locales/hy/nav.json';
import hyHero from '../locales/hy/hero.json';

import esCommon from '../locales/es/common.json';
import esNav from '../locales/es/nav.json';
import esHero from '../locales/es/hero.json';

const resources = {
  en: {
    common: enCommon,
    nav: enNav,
    hero: enHero,
  },
  ru: {
    common: ruCommon,
    nav: ruNav,
    hero: ruHero,
  },
  hy: {
    common: hyCommon,
    nav: hyNav,
    hero: hyHero,
  },
  es: {
    common: esCommon,
    nav: esNav,
    hero: esHero,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    ns: ['common', 'nav', 'hero'],
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: true,
    },
    
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n;