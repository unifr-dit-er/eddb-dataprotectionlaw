'use client'

import { Badge } from '@/components/ui/badge'
import type { Decision } from '@/types/decision'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFilters } from '@/hooks/useFilters'
import { cn } from '@/lib/utils'

interface DecisionCardProps {
  decision: Decision
  isActive: boolean
  onClick: () => void
}

const DecisionCard = ({ decision, isActive, onClick }: DecisionCardProps) => {
  const { locale } = useLanguage()
  const { filters, setFilter } = useFilters()

  const formattedDate = new Date(decision.date).toLocaleDateString(`${locale}-CH`, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const handleCantonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFilter('canton', filters.canton === decision.canton ? '' : decision.canton)
  }

  const handleKeywordClick = (e: React.MouseEvent, kwId: string) => {
    e.stopPropagation()
    setFilter(
      'keywords',
      filters.keywords.includes(kwId)
        ? filters.keywords.filter((k) => k !== kwId)
        : [...filters.keywords, kwId]
    )
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl bg-card border shadow-sm px-5 py-4 transition-all duration-200 cursor-pointer',
        isActive
          ? 'border-primary/40 shadow-md ring-1 ring-primary/10 bg-primary/[0.02]'
          : 'border-border hover:shadow-md hover:border-primary/25'
      )}
    >
      <h3 className="text-base font-medium leading-snug line-clamp-2 mb-2.5 text-foreground">
        {decision.title}
      </h3>
      <div className="flex items-center gap-2 mb-3">
        {decision.canton && (
          <span
            onClick={handleCantonClick}
            className={cn(
              'text-[11px] font-bold tracking-[0.15em] uppercase px-1.5 py-0.5 rounded transition-colors cursor-pointer',
              filters.canton === decision.canton
                ? 'bg-primary/15 text-primary hover:bg-primary/25'
                : 'text-muted-foreground bg-muted hover:bg-primary/15 hover:text-primary'
            )}
          >
            {decision.canton}
          </span>
        )}
        <span className="text-[13px] text-primary font-medium">{formattedDate}</span>
      </div>
      {decision.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {[...decision.keywords].sort((a, b) => a.label.localeCompare(b.label)).map((kw) => (
            <Badge
              key={kw.id}
              variant="secondary"
              onClick={(e) => handleKeywordClick(e, kw.id)}
              className={cn(
                'text-[12px] px-1.5 py-0 font-normal cursor-pointer transition-colors',
                filters.keywords.includes(kw.id)
                  ? 'bg-primary/15 text-primary hover:bg-primary/25'
                  : 'hover:bg-primary/15 hover:text-primary'
              )}
            >
              {kw.label}
            </Badge>
          ))}
        </div>
      )}
    </button>
  )
}

export default DecisionCard
