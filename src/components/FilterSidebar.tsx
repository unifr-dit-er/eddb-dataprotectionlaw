'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useFilters } from '@/hooks/useFilters'
import { useKeywords } from '@/hooks/useKeywords'
import { CANTONS } from '@/lib/cantons'
import { useCallback, useState } from 'react'

const FilterSidebar = () => {
  const { filters, setFilter, resetFilters } = useFilters()
  const { data: keywords = [] } = useKeywords()
  const [qInput, setQInput] = useState(filters.q)

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
    <aside className="w-72 shrink-0 space-y-5 overflow-y-auto pr-4">
      {/* Recherche texte */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Recherche</label>
        <Input
          placeholder="Rechercher…"
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          onKeyDown={handleQKeyDown}
          onBlur={() => setFilter('q', qInput)}
        />
      </div>

      <Separator />

      {/* Canton */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Canton</label>
        <Select
          value={filters.canton || '_all'}
          onValueChange={(v) => setFilter('canton', v === '_all' || v === null ? '' : v)}
        >
          <SelectTrigger>
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

      <Separator />

      {/* Catégories */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-2">Catégories</label>
        <div className="space-y-2">
          {allCategories.map((category) => (
            <div key={category} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${category}`}
                checked={filters.categories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <label htmlFor={`cat-${category}`} className="text-sm cursor-pointer leading-tight">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Mots-clés (visible uniquement si catégories sélectionnées) */}
      {keywordsInActiveCategories.length > 0 && (
        <>
          <Separator />
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">
              Mots-clés
            </label>
            <div className="space-y-2">
              {keywordsInActiveCategories.map((kw) => (
                <div key={kw.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`kw-${kw.id}`}
                    checked={filters.keywords.includes(kw.id)}
                    onCheckedChange={() => toggleKeyword(kw.id)}
                  />
                  <label htmlFor={`kw-${kw.id}`} className="text-sm cursor-pointer">
                    {kw.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Dates */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-2">Période</label>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-muted-foreground">De</label>
            <Input
              type="date"
              value={filters.from}
              onChange={(e) => setFilter('from', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">À</label>
            <Input
              type="date"
              value={filters.to}
              onChange={(e) => setFilter('to', e.target.value)}
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <>
          <Separator />
          <Button variant="ghost" size="sm" onClick={resetFilters} className="w-full">
            Réinitialiser les filtres
          </Button>
        </>
      )}
    </aside>
  )
}

export default FilterSidebar
