import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { LanguageProvider, useLanguage } from '../LanguageContext'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
)

describe('useLanguage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to "fr"', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.locale).toBe('fr')
    expect(result.current.langSuffix).toBe('FR')
  })

  it('reads stored locale from localStorage', () => {
    localStorage.setItem('locale', 'de')
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.locale).toBe('de')
    expect(result.current.langSuffix).toBe('DE')
  })

  it('setLocale updates locale and persists to localStorage', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    act(() => {
      result.current.setLocale('de')
    })
    expect(result.current.locale).toBe('de')
    expect(result.current.langSuffix).toBe('DE')
    expect(localStorage.getItem('locale')).toBe('de')
  })

  it('t() returns the correct translation string', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.t('sidebar.title')).toBe('Protection des données')
    act(() => {
      result.current.setLocale('de')
    })
    expect(result.current.t('sidebar.title')).toBe('Datenschutz')
  })

  it('throws when used outside LanguageProvider', () => {
    // renderHook without wrapper — expect throw
    expect(() => renderHook(() => useLanguage())).toThrow(
      'useLanguage must be used within LanguageProvider'
    )
  })
})
