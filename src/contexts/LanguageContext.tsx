'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  type Locale,
  type LangSuffix,
  type Translations,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  getTranslations,
  getLangSuffix,
} from '@/i18n'

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: keyof Translations) => string
  langSuffix: LangSuffix
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return DEFAULT_LOCALE
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    return stored === 'de' ? 'de' : DEFAULT_LOCALE
  })

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, next)
    setLocaleState(next)
  }, [])

  const translations = getTranslations(locale)
  const t = useCallback(
    (key: keyof Translations) => translations[key],
    [translations]
  )
  const langSuffix = getLangSuffix(locale)

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, langSuffix }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
