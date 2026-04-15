'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import type { Locale } from '@/i18n'
import { cn } from '@/lib/utils'

const LOCALES: Locale[] = ['fr', 'de']

const LanguageSelector = () => {
  const { locale, setLocale } = useLanguage()

  return (
    <div className="flex items-center gap-1">
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={cn(
            'text-[11px] tracking-[0.15em] uppercase font-semibold px-1.5 py-0.5 rounded transition-colors',
            locale === l
              ? 'text-sidebar-foreground bg-sidebar-accent'
              : 'text-sidebar-foreground/35 hover:text-sidebar-foreground/60'
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

export default LanguageSelector
