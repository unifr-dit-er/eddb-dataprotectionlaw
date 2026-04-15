import { describe, it, expect } from 'vitest'
import { getTranslations, getLangSuffix } from '../index'

describe('getTranslations', () => {
  it('returns french translations for "fr"', () => {
    const t = getTranslations('fr')
    expect(t['sidebar.title']).toBe('Protection des données')
    expect(t['sidebar.search.label']).toBe('Recherche')
  })

  it('returns german translations for "de"', () => {
    const t = getTranslations('de')
    expect(t['sidebar.title']).toBe('Datenschutz')
    expect(t['sidebar.search.label']).toBe('Suche')
  })

  it('both locales have the same keys', () => {
    const fr = getTranslations('fr')
    const de = getTranslations('de')
    expect(Object.keys(fr).sort()).toEqual(Object.keys(de).sort())
  })
})

describe('getLangSuffix', () => {
  it('returns "FR" for "fr"', () => {
    expect(getLangSuffix('fr')).toBe('FR')
  })

  it('returns "DE" for "de"', () => {
    expect(getLangSuffix('de')).toBe('DE')
  })
})
