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
import { useFilters } from '@/hooks/useFilters'
import { useKeywords } from '@/hooks/useKeywords'
import { CANTONS } from '@/lib/cantons'
import { useCallback, useEffect, useState } from 'react'

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[9px] tracking-[0.2em] uppercase font-semibold text-sidebar-foreground/45 mb-2.5">
    {children}
  </p>
)

const Divider = () => <div className="h-px bg-sidebar-border/50 my-1" />

const FilterSidebar = () => {
  const { filters, setFilter, resetFilters } = useFilters()
  const { data: keywords = [] } = useKeywords()
  const [qInput, setQInput] = useState(filters.q)

  useEffect(() => {
    setQInput(filters.q)
  }, [filters.q])

  const allCategories = [...new Set(keywords.map((kw) => kw.category))].sort()

  const keywordsInActiveCategories =
    filters.categories.length > 0
      ? keywords.filter((kw) => filters.categories.includes(kw.category))
      : []

  const toggleCategory = useCallback(
    (category: string) => {
      const next = filters.categories.includes(category)
        ? filters.categories.filter((c) => c !== category)
        : [...filters.categories, category]
      setFilter('categories', next)
    },
    [filters.categories, setFilter]
  )

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
    filters.categories.length > 0 ||
    filters.keywords.length > 0 ||
    filters.from ||
    filters.to

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Recherche */}
      <div>
        <SectionLabel>Recherche</SectionLabel>
        <Input
          placeholder="Titre, mot-clé…"
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          onKeyDown={handleQKeyDown}
          onBlur={() => setFilter('q', qInput)}
          className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus-visible:border-primary focus-visible:ring-primary/30 h-8 text-sm"
        />
      </div>

      <Divider />

      {/* Canton */}
      <div>
        <SectionLabel>Canton</SectionLabel>
        <Select
          value={filters.canton || '_all'}
          onValueChange={(v) => setFilter('canton', v === '_all' || v === null ? '' : v)}
        >
          <SelectTrigger className="w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground h-8 text-sm">
            <SelectValue placeholder="Tous les cantons" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Tous les cantons</SelectItem>
            {CANTONS.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Divider />

      {/* Catégories */}
      <div>
        <SectionLabel>Catégories</SectionLabel>
        <div className="space-y-2.5">
          {allCategories.map((category) => (
            <div key={category} className="flex items-center gap-2.5">
              <Checkbox
                id={`cat-${category}`}
                checked={filters.categories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
                className="border-sidebar-border/60"
              />
              <label
                htmlFor={`cat-${category}`}
                className="text-[12px] text-sidebar-foreground/75 cursor-pointer leading-tight"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Mots-clés */}
      {keywordsInActiveCategories.length > 0 && (
        <>
          <Divider />
          <div>
            <SectionLabel>Mots-clés</SectionLabel>
            <div className="space-y-2.5">
              {keywordsInActiveCategories.map((kw) => (
                <div key={kw.id} className="flex items-center gap-2.5">
                  <Checkbox
                    id={`kw-${kw.id}`}
                    checked={filters.keywords.includes(kw.id)}
                    onCheckedChange={() => toggleKeyword(kw.id)}
                    className="border-sidebar-border/60"
                  />
                  <label
                    htmlFor={`kw-${kw.id}`}
                    className="text-[12px] text-sidebar-foreground/75 cursor-pointer"
                  >
                    {kw.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Divider />

      {/* Période */}
      <div>
        <SectionLabel>Période</SectionLabel>
        <div className="space-y-2">
          <div>
            <p className="text-[9px] text-sidebar-foreground/40 mb-1 tracking-widest uppercase">De</p>
            <Input
              type="date"
              value={filters.from}
              onChange={(e) => setFilter('from', e.target.value)}
              className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground focus-visible:border-primary focus-visible:ring-primary/30 h-8 text-sm"
            />
          </div>
          <div>
            <p className="text-[9px] text-sidebar-foreground/40 mb-1 tracking-widest uppercase">À</p>
            <Input
              type="date"
              value={filters.to}
              onChange={(e) => setFilter('to', e.target.value)}
              className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground focus-visible:border-primary focus-visible:ring-primary/30 h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <>
          <Divider />
          <button
            onClick={resetFilters}
            className="w-full text-[11px] text-sidebar-foreground/45 hover:text-sidebar-foreground/80 transition-colors py-1 text-center"
          >
            Réinitialiser les filtres
          </button>
        </>
      )}
    </div>
  )
}

export default FilterSidebar
