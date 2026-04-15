'use client'

import { Checkbox } from '@/components/ui/checkbox'
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
import { useKeywords } from '@/hooks/useKeywords'
import { CANTONS } from '@/lib/cantons'
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

  useEffect(() => {
    setQInput(filters.q)
  }, [filters.q])

  const toggleKeyword = useCallback(
    (kwId: string) => {
      const next = filters.keywords.includes(kwId)
        ? filters.keywords.filter((k) => k !== kwId)
        : [...filters.keywords, kwId]
      setFilter('keywords', next)
    },
    [filters.keywords, setFilter]
  )

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

      {/* Keywords */}
      {keywords.length > 0 && (
        <div>
          <SectionLabel>{t('sidebar.keywords.label')}</SectionLabel>
          <div className="space-y-2.5">
            {keywords.map((kw) => (
              <div key={kw.id} className="flex items-center gap-2.5">
                <Checkbox
                  id={`kw-${kw.id}`}
                  checked={filters.keywords.includes(kw.id)}
                  onCheckedChange={() => toggleKeyword(kw.id)}
                  className="border-sidebar-border/60"
                />
                <label
                  htmlFor={`kw-${kw.id}`}
                  className="text-sm text-sidebar-foreground/75 cursor-pointer leading-tight"
                >
                  {kw.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <Divider />

      {/* Period */}
      <div>
        <SectionLabel>{t('sidebar.period.label')}</SectionLabel>
        <div className="space-y-2">
          <div>
            <p className="text-[11px] text-sidebar-foreground/40 mb-1 tracking-widest uppercase">
              {t('sidebar.period.from')}
            </p>
            <Input
              type="date"
              value={filters.from}
              onChange={(e) => setFilter('from', e.target.value)}
              className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground focus-visible:border-primary focus-visible:ring-primary/30 h-9 text-base"
            />
          </div>
          <div>
            <p className="text-[11px] text-sidebar-foreground/40 mb-1 tracking-widest uppercase">
              {t('sidebar.period.to')}
            </p>
            <Input
              type="date"
              value={filters.to}
              onChange={(e) => setFilter('to', e.target.value)}
              className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground focus-visible:border-primary focus-visible:ring-primary/30 h-9 text-base"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <>
          <Divider />
          <button
            onClick={resetFilters}
            className="w-full text-[13px] text-sidebar-foreground/45 hover:text-sidebar-foreground/80 transition-colors py-1 text-center"
          >
            {t('sidebar.resetFilters')}
          </button>
        </>
      )}
    </div>
  )
}

export default FilterSidebar
