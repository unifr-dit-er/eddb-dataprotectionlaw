'use client'

import DecisionList from '@/components/DecisionList'
import DecisionPanel from '@/components/DecisionPanel'
import FilterSidebar from '@/components/FilterSidebar'
import LanguageSelector from '@/components/LanguageSelector'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLanguage } from '@/contexts/LanguageContext'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const HomeContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()

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
        <div className="px-6 pt-7 pb-6 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] tracking-[0.25em] uppercase font-semibold text-sidebar-foreground/40">
              {t('sidebar.subtitle')}
            </p>
            <LanguageSelector />
          </div>
          <h1 className="text-lg font-semibold text-sidebar-foreground leading-[1.3]">
            {t('sidebar.title')}
          </h1>
        </div>
        <div className="h-px bg-sidebar-border/60 mx-4 shrink-0" />
        <ScrollArea className="flex-1">
          <FilterSidebar />
        </ScrollArea>
      </aside>
      <main className="flex-1 overflow-y-auto bg-background">
        <DecisionList />
      </main>
      <DecisionPanel decisionId={decisionId} onClose={closePanel} />
    </div>
  )
}

export default HomeContent
