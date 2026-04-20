'use client'

import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFilters } from '@/hooks/useFilters'
import DatePickerFilter from '@/components/DatePickerFilter'
import { useKeywords } from '@/hooks/useKeywords'
import { CANTONS } from '@/lib/cantons'
import { cn } from '@/lib/utils'
import type { Keyword } from '@/types/keyword'
import { ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] tracking-[0.2em] uppercase font-semibold text-sidebar-foreground/45 mb-2.5">
    {children}
  </p>
)

const Divider = () => <div className="h-px bg-sidebar-border/50 my-1" />

const FilterSidebar = () => {
  const { filters, setFilter, resetFilters } = useFilters()
  const { data: keywords = [] } = useKeywords()
  const { t } = useLanguage()
  const [qInput, setQInput] = useState(filters.q)
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    setQInput(filters.q)
  }, [filters.q])

  // Group keywords by category. A keyword with multiple categories would appear
  // in each group — the checked state is shared via keyword ID regardless.
  const keywordsByCategory = keywords.reduce<Map<string, Keyword[]>>((acc, kw) => {
    const cat = kw.category || '—'
    if (!acc.has(cat)) acc.set(cat, [])
    acc.get(cat)!.push(kw)
    return acc
  }, new Map())

  const sortedCategories = [...keywordsByCategory.keys()].sort()
  keywordsByCategory.forEach((kws) => kws.sort((a, b) => a.label.localeCompare(b.label)))

  const toggleKeyword = useCallback(
    (kwId: string) => {
      const next = filters.keywords.includes(kwId)
        ? filters.keywords.filter((k) => k !== kwId)
        : [...filters.keywords, kwId]
      setFilter('keywords', next)
    },
    [filters.keywords, setFilter]
  )

  const toggleOpen = useCallback((category: string, open: boolean) => {
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (open) next.add(category)
      else next.delete(category)
      return next
    })
  }, [])

  const handleQKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') setFilter('q', qInput)
  }

  const hasActiveFilters =
    filters.q ||
    filters.canton ||
    filters.keywords.length > 0 ||
    filters.from ||
    filters.to

  return (
    <div className="px-4 py-5 space-y-5">
      {hasActiveFilters && (
        <>
          <button
            onClick={resetFilters}
            className="w-full text-[13px] text-sidebar-foreground/45 hover:text-sidebar-foreground/80 transition-colors py-1 text-center"
          >
            {t('sidebar.resetFilters')}
          </button>
          <Divider />
        </>
      )}

      {/* Search */}
      <div>
        <SectionLabel>{t('sidebar.search.label')}</SectionLabel>
        <Input
          placeholder={t('sidebar.search.placeholder')}
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          onKeyDown={handleQKeyDown}
          onBlur={() => setFilter('q', qInput)}
          className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus-visible:border-primary focus-visible:ring-primary/30 h-9 text-base"
        />
      </div>

      <Divider />

      {/* Canton */}
      <div>
        <SectionLabel>{t('sidebar.canton.label')}</SectionLabel>
        <Select
          value={filters.canton || '_all'}
          onValueChange={(v) => setFilter('canton', v === '_all' || v === null ? '' : v)}
        >
          <SelectTrigger className="w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground h-9 text-base">
            <SelectValue placeholder={t('sidebar.canton.all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">{t('sidebar.canton.all')}</SelectItem>
            {CANTONS.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Divider />

      {/* Period */}
      <div>
        <SectionLabel>{t('sidebar.period.label')}</SectionLabel>
        <div className="space-y-2">
          <div>
            <p className="text-[11px] text-sidebar-foreground/40 mb-1 tracking-widest uppercase">
              {t('sidebar.period.from')}
            </p>
            <DatePickerFilter
              value={filters.from}
              onChange={(v) => setFilter('from', v)}
              placeholder={t('sidebar.period.from')}
            />
          </div>
          <div>
            <p className="text-[11px] text-sidebar-foreground/40 mb-1 tracking-widest uppercase">
              {t('sidebar.period.to')}
            </p>
            <DatePickerFilter
              value={filters.to}
              onChange={(v) => setFilter('to', v)}
              placeholder={t('sidebar.period.to')}
            />
          </div>
        </div>
      </div>

      {/* Keywords grouped by category */}
      {sortedCategories.length > 0 && (
        <>
          <Divider />
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <SectionLabel>{t('sidebar.keywords.label')}</SectionLabel>
              {openCategories.size > 0 && (
                <button
                  onClick={() => setOpenCategories(new Set())}
                  className="text-[11px] text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors -mt-2.5"
                >
                  {t('sidebar.keywords.collapseAll')}
                </button>
              )}
            </div>
            <div className="space-y-0.5">
              {sortedCategories.map((category) => {
                const catKeywords = keywordsByCategory.get(category)!
                const selectedCount = catKeywords.filter((kw) =>
                  filters.keywords.includes(kw.id)
                ).length
                const isOpen = openCategories.has(category)

                return (
                  <Collapsible
                    key={category}
                    open={isOpen}
                    onOpenChange={(open) => toggleOpen(category, open)}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5 text-left group">
                      <span className="text-sm text-sidebar-foreground/80 font-medium leading-tight">
                        {category}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {selectedCount > 0 && (
                          <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 leading-5 font-semibold">
                            {selectedCount}
                          </span>
                        )}
                        <ChevronRight
                          className={cn(
                            'h-3.5 w-3.5 text-sidebar-foreground/35 transition-transform duration-150',
                            isOpen && 'rotate-90'
                          )}
                        />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-2 pl-1 pt-1 pb-2">
                        {catKeywords.map((kw) => (
                          <div key={kw.id} className="flex items-center gap-2.5">
                            <Checkbox
                              id={`kw-${category}-${kw.id}`}
                              checked={filters.keywords.includes(kw.id)}
                              onCheckedChange={() => toggleKeyword(kw.id)}
                              className="border-sidebar-border/60"
                            />
                            <label
                              htmlFor={`kw-${category}-${kw.id}`}
                              className="flex-1 flex items-center justify-between gap-1.5 text-sm text-sidebar-foreground/65 cursor-pointer leading-tight"
                            >
                              <span>{kw.label}</span>
                              {kw.decisionsCount > 0 && (
                                <span className="text-[10px] text-sidebar-foreground/50 tabular-nums shrink-0">
                                  {kw.decisionsCount}
                                </span>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </div>
          </div>
        </>
      )}


    </div>
  )
}

export default FilterSidebar
