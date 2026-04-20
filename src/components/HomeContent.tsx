'use client'

import DecisionList from '@/components/DecisionList'
import DecisionPanel from '@/components/DecisionPanel'
import FilterSidebar from '@/components/FilterSidebar'
import LanguageSelector from '@/components/LanguageSelector'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFontSize } from '@/contexts/FontSizeContext'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

const HomeContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()
  const { fontSize, setFontSize, fontSizes, fontSizeLabels } = useFontSize()

  const decisionId = searchParams.get('decision')

  const closePanel = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('decision')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }, [searchParams, router, pathname])

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-80 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col overflow-hidden border-r border-sidebar-border">
        <div className="bg-white px-4 py-4 shrink-0">
          <Image src="/unifr.png" alt="Université de Fribourg" width={340} height={84} className="h-10 w-auto object-contain" loading="eager" priority />
        </div>
        <div className="h-px bg-sidebar-border/60 shrink-0" />
        <ScrollArea className="flex-1 min-h-0">
          <FilterSidebar />
        </ScrollArea>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        <header className="shrink-0 border-b border-border px-8 py-4 flex items-center justify-between gap-6">
          <h1 className="text-base font-semibold text-foreground leading-snug">
            {t('header.title')}
          </h1>
          <div className="flex items-center gap-3 shrink-0">
            <Select value={fontSize} onValueChange={(v) => setFontSize(v as typeof fontSize)}>
              <SelectTrigger className="data-[size=default]:h-auto border-0 shadow-none focus-visible:ring-0 focus-visible:border-0 px-1.5 py-0.5 text-[11px] tracking-[0.15em] uppercase font-semibold bg-muted text-foreground rounded gap-1 [&_svg:not([class*='size-'])]:size-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" side="bottom" align="end">
                {fontSizes.map((size) => (
                  <SelectItem key={size} value={size} className="text-[11px] uppercase font-semibold tracking-[0.1em]">
                    {fontSizeLabels[size]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-px h-4 bg-border" />
            <LanguageSelector />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <DecisionList />
        </div>
        <footer className="shrink-0 border-t border-border px-8 py-2">
          <p className="flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase font-semibold text-muted-foreground/60">
            <span className="inline-block h-2.5 w-2.5 bg-primary shrink-0" />
            <a href={t('footer.faculty.url')} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              {t('footer.faculty')}
            </a>
            <ChevronRight className="inline h-3 w-3 mx-1 opacity-50" />
            <a href={t('footer.institute.url')} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              {t('footer.institute')}
            </a>
          </p>
        </footer>
      </main>
      <DecisionPanel decisionId={decisionId} onClose={closePanel} />
    </div>
  )
}

export default HomeContent
