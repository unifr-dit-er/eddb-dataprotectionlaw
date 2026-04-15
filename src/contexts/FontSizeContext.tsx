'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

export type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const FONT_SIZE_VALUES: Record<FontSize, string> = {
  xs: '13px',
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '20px',
}

const FONT_SIZE_LABELS: Record<FontSize, string> = {
  xs: 'XS',
  sm: 'S',
  md: 'M',
  lg: 'L',
  xl: 'XL',
}

const FONT_SIZES: FontSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const DEFAULT_FONT_SIZE: FontSize = 'md'
const STORAGE_KEY = 'font-size'

interface FontSizeContextValue {
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
  fontSizes: FontSize[]
  fontSizeLabels: Record<FontSize, string>
}

const FontSizeContext = createContext<FontSizeContextValue | null>(null)

export const FontSizeProvider = ({ children }: { children: ReactNode }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    if (typeof window === 'undefined') return DEFAULT_FONT_SIZE
    const stored = localStorage.getItem(STORAGE_KEY)
    return (FONT_SIZES.includes(stored as FontSize) ? stored : DEFAULT_FONT_SIZE) as FontSize
  })

  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_VALUES[fontSize]
  }, [fontSize])

  const setFontSize = useCallback((size: FontSize) => {
    localStorage.setItem(STORAGE_KEY, size)
    setFontSizeState(size)
  }, [])

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize, fontSizes: FONT_SIZES, fontSizeLabels: FONT_SIZE_LABELS }}>
      {children}
    </FontSizeContext.Provider>
  )
}

export const useFontSize = (): FontSizeContextValue => {
  const ctx = useContext(FontSizeContext)
  if (!ctx) throw new Error('useFontSize must be used within FontSizeProvider')
  return ctx
}
