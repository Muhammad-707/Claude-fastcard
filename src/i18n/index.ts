import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { DEFAULT_LANG } from '@/shared/config/env'
import en from './locales/en.json'
import ru from './locales/ru.json'
import tj from './locales/tj.json'

const savedLang = localStorage.getItem('i18nextLng') ?? DEFAULT_LANG

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
      tj: { translation: tj },
    },
    lng: savedLang,
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
