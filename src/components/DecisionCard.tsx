'use client'

import { Badge } from '@/components/ui/badge'
import type { Decision } from '@/types/decision'
import { cn } from '@/lib/utils'

interface DecisionCardProps {
  decision: Decision
  isActive: boolean
  onClick: () => void
}

const DecisionCard = ({ decision, isActive, onClick }: DecisionCardProps) => {
  const formattedDate = new Date(decision.date).toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 border rounded-lg transition-colors hover:bg-accent',
        isActive && 'bg-accent border-primary'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-sm font-medium leading-snug line-clamp-2">{decision.title}</h3>
        <span className="text-xs text-muted-foreground shrink-0">{decision.canton}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{formattedDate}</p>
      <div className="flex flex-wrap gap-1">
        {decision.keywords.slice(0, 3).map((kw) => (
          <Badge key={kw.id} variant="secondary" className="text-xs">
            {kw.label}
          </Badge>
        ))}
        {decision.keywords.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{decision.keywords.length - 3}
          </Badge>
        )}
      </div>
    </button>
  )
}

export default DecisionCard
