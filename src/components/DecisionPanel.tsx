'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="flex flex-row items-start justify-between gap-3 mb-6">
          <SheetTitle className="font-heading text-xl font-bold leading-snug flex-1 text-foreground">
            {decision?.title ?? (isLoading ? 'Chargement…' : '')}
          </SheetTitle>
          <button
            onClick={handleCopyLink}
            title="Copier le lien"
            className="text-muted-foreground hover:text-foreground transition-colors mt-0.5 shrink-0"
          >
            <Copy className="h-4 w-4" />
          </button>
        </SheetHeader>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        )}

        {decision && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              {decision.canton && (
                <span className="text-[9px] font-bold tracking-[0.15em] uppercase bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                  {getCantonLabel(decision.canton)}
                </span>
              )}
              <span className="text-[11px] text-primary font-medium">{formattedDate}</span>
            </div>

            <Card className="gap-0 py-0">
              <CardContent className="p-4">
                <p className="text-sm leading-relaxed text-foreground/85">{decision.abstract}</p>
              </CardContent>
            </Card>

            {groupedKeywords && Object.keys(groupedKeywords).length > 0 && (
              <Card className="gap-0 py-0">
                <CardContent className="p-4 space-y-4">
                  {Object.entries(groupedKeywords).map(([category, labels]) => (
                    <div key={category}>
                      <p className="text-[9px] tracking-[0.2em] uppercase font-semibold text-muted-foreground mb-2">
                        {category}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {labels.map((label) => (
                          <Badge
                            key={label}
                            variant="secondary"
                            className="text-[10px] px-2 py-0.5 font-normal"
                          >
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {decision.pdfUrl && (
              <a
                href={decision.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                <Download className="h-4 w-4" />
                Télécharger le document PDF
              </a>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default DecisionPanel
