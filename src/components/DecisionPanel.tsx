'use client'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useDecision } from '@/hooks/useDecision'
import { getCantonLabel } from '@/lib/cantons'
import { Copy, Download } from 'lucide-react'

interface DecisionPanelProps {
  decisionId: string | null
  onClose: () => void
}

const DecisionPanel = ({ decisionId, onClose }: DecisionPanelProps) => {
  const { data: decision, isLoading } = useDecision(decisionId)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
  }

  const groupedKeywords = decision?.keywords.reduce<Record<string, string[]>>(
    (acc, kw) => {
      if (!acc[kw.category]) acc[kw.category] = []
      acc[kw.category].push(kw.label)
      return acc
    },
    {}
  )

  const formattedDate = decision
    ? new Date(decision.date).toLocaleDateString('fr-CH', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <Sheet open={!!decisionId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="flex flex-row items-center justify-between gap-2">
          <SheetTitle className="text-base leading-snug line-clamp-2 flex-1">
            {decision?.title ?? (isLoading ? 'Chargement…' : '')}
          </SheetTitle>
          <Button variant="ghost" size="icon" onClick={handleCopyLink} title="Copier le lien">
            <Copy className="h-4 w-4" />
          </Button>
        </SheetHeader>

        {isLoading && (
          <div className="space-y-4 mt-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {decision && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{getCantonLabel(decision.canton)}</span>
              <span>·</span>
              <span>{formattedDate}</span>
            </div>

            <Separator />

            <div>
              <p className="text-sm leading-relaxed">{decision.abstract}</p>
            </div>

            {groupedKeywords && Object.keys(groupedKeywords).length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  {Object.entries(groupedKeywords).map(([category, labels]) => (
                    <div key={category}>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{category}</p>
                      <div className="flex flex-wrap gap-1">
                        {labels.map((label) => (
                          <Badge key={label} variant="secondary" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <Separator />

            <a
              href={decision.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'outline', className: 'w-full' })}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger le PDF
            </a>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default DecisionPanel
