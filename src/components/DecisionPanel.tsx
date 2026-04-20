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
import { useLanguage } from '@/contexts/LanguageContext'
import { useFilters } from '@/hooks/useFilters'
import { getCantonLabel } from '@/lib/cantons'
import { cn } from '@/lib/utils'
import { Copy, Download } from 'lucide-react'

interface DecisionPanelProps {
  decisionId: string | null
  onClose: () => void
}

const DecisionPanel = ({ decisionId, onClose }: DecisionPanelProps) => {
  const { data: decision, isLoading } = useDecision(decisionId)
  const { t, locale } = useLanguage()
  const { filters, setFilter } = useFilters()

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
  }

  const handleCantonClick = () => {
    if (!decision?.canton) return
    setFilter('canton', filters.canton === decision.canton ? '' : decision.canton)
  }

  const handleKeywordClick = (kwId: string) => {
    setFilter(
      'keywords',
      filters.keywords.includes(kwId)
        ? filters.keywords.filter((k) => k !== kwId)
        : [...filters.keywords, kwId]
    )
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
    ? new Date(decision.date).toLocaleDateString(`${locale}-CH`, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <Sheet open={!!decisionId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="overflow-y-auto px-6 pb-6 w-[42vw] min-w-[420px] max-w-[760px] sm:max-w-[760px]" showCloseButton={false}>
        <SheetHeader className="flex flex-row items-start justify-between gap-3 px-0 pt-6 pb-0 mb-6">
          <SheetTitle className="font-heading text-2xl font-bold leading-snug flex-1 text-foreground">
            {decision?.title ?? (isLoading ? t('decision.loading') : '')}
          </SheetTitle>
          <button
            onClick={handleCopyLink}
            title={t('decision.copyLink')}
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
                <span
                  onClick={handleCantonClick}
                  className={cn(
                    'text-[11px] font-bold tracking-[0.15em] uppercase px-1.5 py-0.5 rounded transition-colors cursor-pointer',
                    filters.canton === decision.canton
                      ? 'bg-primary/15 text-primary hover:bg-primary/25'
                      : 'bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary'
                  )}
                >
                  {getCantonLabel(decision.canton)}
                </span>
              )}
              <span className="text-[13px] text-primary font-medium">{formattedDate}</span>
            </div>

            <Card className="gap-0 py-0">
              <CardContent className="p-4">
                <p className="text-base leading-relaxed text-foreground/85">{decision.abstract}</p>
              </CardContent>
            </Card>

            {groupedKeywords && Object.keys(groupedKeywords).length > 0 && (
              <div className="space-y-4">
                {Object.keys(groupedKeywords).map((category) => (
                  <div key={category}>
                    <p className="text-[11px] tracking-[0.2em] uppercase font-semibold text-muted-foreground mb-2">
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {decision.keywords
                        .filter((kw) => kw.category === category)
                        .sort((a, b) => a.label.localeCompare(b.label))
                        .map((kw) => (
                        <Badge
                          key={kw.id}
                          variant="secondary"
                          onClick={() => handleKeywordClick(kw.id)}
                          className={cn(
                            'text-[12px] px-2 py-0.5 font-normal cursor-pointer transition-colors',
                            filters.keywords.includes(kw.id)
                              ? 'bg-primary/15 text-primary hover:bg-primary/25'
                              : 'hover:bg-primary/15 hover:text-primary'
                          )}
                        >
                          {kw.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {decision.pdfUrl && (
              <a
                href={decision.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-base text-primary hover:text-primary/80 transition-colors font-medium"
              >
                <Download className="h-4 w-4" />
                {t('decision.downloadPdf')}
              </a>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default DecisionPanel
