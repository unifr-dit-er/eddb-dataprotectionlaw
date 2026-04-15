'use client'

import { Skeleton } from '@/components/ui/skeleton'
import DecisionCard from '@/components/DecisionCard'
import { useDecisions } from '@/hooks/useDecisions'
import { useFilters } from '@/hooks/useFilters'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

const DecisionList = () => {
  const { filters, setFilter } = useFilters()
  const { data, isLoading, isError } = useDecisions(filters)
  const { t } = useLanguage()
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
      <div className="flex items-center justify-center h-64 text-base text-muted-foreground">
        {t('decisions.error')}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-card border border-border shadow-sm px-5 py-4 space-y-2">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-1/3" />
            <div className="flex gap-1.5 pt-0.5">
              <Skeleton className="h-4 w-14 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const decisions = data?.list ?? []
  const pageInfo = data?.pageInfo

  if (decisions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-base text-muted-foreground">
        {t('decisions.empty')}
      </div>
    )
  }

  const resultUnit =
    pageInfo?.totalRows === 1
      ? t('decisions.resultUnit_singular')
      : t('decisions.resultUnit_plural')

  return (
    <div className="p-6 space-y-6">
      {pageInfo && (
        <p className="text-sm text-muted-foreground">
          {pageInfo.totalRows} {resultUnit}
        </p>
      )}

      <div className="space-y-3">
        {decisions.map((decision) => (
          <DecisionCard
            key={decision.id}
            decision={decision}
            isActive={decision.id === activeDecisionId}
            onClick={() => openDecision(decision.id)}
          />
        ))}
      </div>

      {pageInfo && pageInfo.totalRows > pageInfo.pageSize && (
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-muted-foreground">
            {t('decisions.page')} {filters.page} / {Math.ceil(pageInfo.totalRows / pageInfo.pageSize)}
          </span>
          <div className="flex gap-5">
            <button
              disabled={pageInfo.isFirstPage}
              onClick={() => setFilter('page', filters.page - 1)}
              className="text-[13px] text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t('decisions.prev')}
            </button>
            <button
              disabled={pageInfo.isLastPage}
              onClick={() => setFilter('page', filters.page + 1)}
              className="text-[13px] text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t('decisions.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DecisionList
