'use client'

import { Badge } from '@/components/ui/badge'
import type { Decision } from '@/types/decision'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

interface DecisionCardProps {
  decision: Decision
  isActive: boolean
  onClick: () => void
}

const DecisionCard = ({ decision, isActive, onClick }: DecisionCardProps) => {
  const { locale } = useLanguage()

  const formattedDate = new Date(decision.date).toLocaleDateString(`${locale}-CH`, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

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
          <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {decision.canton}
          </span>
        )}
        <span className="text-[13px] text-primary font-medium">{formattedDate}</span>
      </div>
      {decision.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {[...decision.keywords].sort((a, b) => a.label.localeCompare(b.label)).map((kw) => (
            <Badge key={kw.id} variant="secondary" className="text-[12px] px-1.5 py-0 font-normal">
              {kw.label}
            </Badge>
          ))}
        </div>
      )}
    </button>
  )
}

export default DecisionCard
