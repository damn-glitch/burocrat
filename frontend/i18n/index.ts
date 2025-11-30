import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ru from '@/locales/ru.json';

const resources = {
  ru: { translation: ru },
};

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: (callback: (lang: string) => void) => {
    callback(Localization.getLocales()[0].languageCode ?? 'ru');
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector as any)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru',
    interpolation: { escapeValue: false },
  });

export default i18n;