'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import DecisionCard from '@/components/DecisionCard'
import { useDecisions } from '@/hooks/useDecisions'
import { useFilters } from '@/hooks/useFilters'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

const DecisionList = () => {
  const { filters, setFilter } = useFilters()
  const { data, isLoading, isError } = useDecisions(filters)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeDecisionId = searchParams.get('decision')

  const openDecision = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('decision', id)
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Une erreur est survenue lors du chargement des décisions.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  const decisions = data?.list ?? []
  const pageInfo = data?.pageInfo

  if (decisions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Aucune décision ne correspond à vos critères.
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="space-y-2">
        {decisions.map((decision) => (
          <DecisionCard
            key={decision.id}
            decision={decision}
            isActive={decision.id === activeDecisionId}
            onClick={() => openDecision(decision.id)}
          />
        ))}
      </div>

      {pageInfo && (
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
          <span>
            {pageInfo.totalRows} décision{pageInfo.totalRows !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pageInfo.isFirstPage}
              onClick={() => setFilter('page', filters.page - 1)}
            >
              Précédent
            </Button>
            <span>
              Page {pageInfo.page} / {Math.ceil(pageInfo.totalRows / pageInfo.pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pageInfo.isLastPage}
              onClick={() => setFilter('page', filters.page + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DecisionList
