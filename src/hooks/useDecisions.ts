import type { Filters } from '@/types/filters'
import type { Decision } from '@/types/decision'
import type { NocoDBListResponse } from '@/types/nocodb'
import type { LangSuffix } from '@/i18n'
import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import { NOCODB_TABLES } from '@/lib/nocodb-tables'
import { mapDecision } from '@/lib/nocodb-mappers'
import { useLanguage } from '@/contexts/LanguageContext'
export const DECISIONS_QUERY_KEY = (filters: Filters, langSuffix: LangSuffix) =>
  ['decisions', filters, langSuffix] as const

const PAGE_SIZE = 25

type DecisionsResult = NocoDBListResponse<Decision> & { _devQueries: string[] }

const buildQueryString = (
  filters: Filters,
  langSuffix: LangSuffix,
  decisionIds?: string[]
): string => {
  const params = new URLSearchParams()
  const conditions: string[] = []

  if (filters.q) conditions.push(`(Description${langSuffix},like,%${filters.q}%)`)
  if (filters.canton) conditions.push(`(Canton,eq,${filters.canton})`)
  if (filters.from) conditions.push(`(Date,ge,exactDate,${filters.from})`)
  if (filters.to) conditions.push(`(Date,le,exactDate,${filters.to})`)
  if (decisionIds) conditions.push(`(Id,in,${decisionIds.join(',')})`)

  if (conditions.length > 0) params.set('where', conditions.join('~and'))
  params.set('limit', String(PAGE_SIZE))
  params.set('offset', String((filters.page - 1) * PAGE_SIZE))
  params.set('sort', '-Date')

  return params.toString()
}

const fetchDecisionIdsForKeywords = async (
  keywordIds: string[]
): Promise<{ ids: string[]; devQuery: string }> => {
  const where = `(Keywords_id,in,${keywordIds.join(',')})`
  const params = new URLSearchParams({ where, limit: '1000', fields: 'Decisions_id' })
  const devQuery = `/api/v2/tables/${NOCODB_TABLES.DECISIONS_KEYWORDS}/records?${params}`
  const response = await fetch(`/api/nocodb${devQuery}`)
  if (!response.ok) throw new Error('Failed to fetch keyword-decision links')
  const data = await response.json()
  const ids = (data.list ?? []).map((r: Record<string, unknown>) => String(r.Decisions_id))
  return { ids: [...new Set(ids)] as string[], devQuery }
}

const fetchDecisions = async (
  filters: Filters,
  langSuffix: LangSuffix,
  keywordIds: string[],
  onQueriesUpdate: (queries: string[]) => void
): Promise<DecisionsResult> => {
  let decisionIds: string[] | undefined
  const devQueries: string[] = []

  const pushQuery = (q: string) => {
    devQueries.push(q)
    onQueriesUpdate([...devQueries])
  }

  if (keywordIds.length > 0) {
    const { ids, devQuery } = await fetchDecisionIdsForKeywords(keywordIds)
    pushQuery(devQuery)
    decisionIds = ids
    if (decisionIds.length === 0) {
      const qs = buildQueryString(filters, langSuffix, [])
      pushQuery(`/api/v2/tables/${NOCODB_TABLES.DECISIONS}/records?${qs}`)
      return {
        list: [],
        pageInfo: { totalRows: 0, page: filters.page, pageSize: PAGE_SIZE, isFirstPage: true, isLastPage: true },
        _devQueries: devQueries,
      }
    }
  }

  const qs = buildQueryString(filters, langSuffix, decisionIds)
  pushQuery(`/api/v2/tables/${NOCODB_TABLES.DECISIONS}/records?${qs}`)

  const response = await fetch(
    `/api/nocodb/api/v2/tables/${NOCODB_TABLES.DECISIONS}/records?${qs}`
  )
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error ?? `HTTP ${response.status}`)
  }
  const data = await response.json()

  return {
    list: (data.list ?? []).map((r: Record<string, unknown>) => mapDecision(r, langSuffix)),
    pageInfo: data.pageInfo,
    _devQueries: devQueries,
  }
}

export const useDecisions = (filters: Filters) => {
  const { langSuffix } = useLanguage()
  // Tracks the last attempted queries — updated progressively during fetch so
  // that even on error the callout shows the real queries (not the placeholder).
  const lastQueriesRef = useRef<string[]>([])

  const query = useQuery({
    queryKey: DECISIONS_QUERY_KEY(filters, langSuffix),
    queryFn: () =>
      fetchDecisions(filters, langSuffix, filters.keywords, (qs) => {
        lastQueriesRef.current = qs
      }),
    staleTime: 5 * 60 * 1000,
  })

  // Prefer data._devQueries (full set after success), then the ref (partial on
  // error), then the static placeholder while the first fetch is in flight.
  const pendingQueries: string[] = filters.keywords.length > 0
    ? [
        `/api/v2/tables/${NOCODB_TABLES.DECISIONS_KEYWORDS}/records?` +
          new URLSearchParams({
            where: `(Keywords_id,in,${filters.keywords.join(',')})`,
            limit: '1000',
            fields: 'Decisions_id',
          }).toString(),
        `/api/v2/tables/${NOCODB_TABLES.DECISIONS}/records?` +
          buildQueryString(filters, langSuffix, ['<pending>']),
      ]
    : [`/api/v2/tables/${NOCODB_TABLES.DECISIONS}/records?` + buildQueryString(filters, langSuffix)]

  const nocodbQueries =
    query.data?._devQueries ??
    (lastQueriesRef.current.length > 0 ? lastQueriesRef.current : pendingQueries)

  const nocodbError =
    query.error instanceof Error ? query.error.message : undefined

  return { ...query, nocodbQueries, nocodbError }
}
