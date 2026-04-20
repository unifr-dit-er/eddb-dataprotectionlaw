import { fr } from './fr'
import { de } from './de'

export type Locale = 'fr' | 'de'
export type LangSuffix = 'FR' | 'DE'

export interface Translations {
  'header.title': string
  'sidebar.subtitle': string
  'sidebar.search.label': string
  'sidebar.search.placeholder': string
  'sidebar.canton.label': string
  'sidebar.canton.all': string
  'sidebar.categories.label': string
  'sidebar.keywords.label': string
  'sidebar.keywords.collapseAll': string
  'sidebar.fontSize.label': string
  'sidebar.period.label': string
  'sidebar.period.from': string
  'sidebar.period.to': string
  'sidebar.resetFilters': string
  'decision.loading': string
  'decision.copyLink': string
  'decision.downloadPdf': string
  'decisions.error': string
  'decisions.empty': string
  'decisions.resultUnit_singular': string
  'decisions.resultUnit_plural': string
  'decisions.page': string
  'decisions.prev': string
  'decisions.next': string
}

export const LOCALE_STORAGE_KEY = 'locale'
export const DEFAULT_LOCALE: Locale = 'fr'

export const getTranslations = (locale: Locale): Translations =>
  locale === 'de' ? de : fr

export const getLangSuffix = (locale: Locale): LangSuffix =>
  locale === 'de' ? 'DE' : 'FR'
