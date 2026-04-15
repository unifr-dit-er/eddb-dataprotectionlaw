import type { Filters } from '@/types/filters'
import type { Decision } from '@/types/decision'
import type { NocoDBListResponse } from '@/types/nocodb'
import type { LangSuffix } from '@/i18n'
import { useQuery } from '@tanstack/react-query'
import { NOCODB_TABLES } from '@/lib/nocodb-tables'
import { mapDecision } from '@/lib/nocodb-mappers'
import { useLanguage } from '@/contexts/LanguageContext'
export const DECISIONS_QUERY_KEY = (filters: Filters, langSuffix: LangSuffix) =>
  ['decisions', filters, langSuffix] as const

const PAGE_SIZE = 25

const buildQueryString = (
  filters: Filters,
  langSuffix: LangSuffix,
  decisionIds?: string[]
): string => {
  const params = new URLSearchParams()
  const conditions: string[] = []

  if (filters.q) conditions.push(`(Description${langSuffix},like,%${filters.q}%)`)
  if (filters.canton) conditions.push(`(Canton,eq,${filters.canton})`)
  if (filters.from) conditions.push(`(Date,gte,${filters.from})`)
  if (filters.to) conditions.push(`(Date,lte,${filters.to})`)
  if (decisionIds) conditions.push(`(Id,in,${decisionIds.join(',')})`)

  if (conditions.length > 0) params.set('where', conditions.join('~and'))
  params.set('limit', String(PAGE_SIZE))
  params.set('offset', String((filters.page - 1) * PAGE_SIZE))
  params.set('sort', '-Date')

  return params.toString()
}

const fetchDecisionIdsForKeywords = async (keywordIds: string[]): Promise<string[]> => {
  const where = `(Keywords_id,in,${keywordIds.join(',')})`
  const params = new URLSearchParams({ where, limit: '1000', fields: 'Decisions_id' })
  const response = await fetch(
    `/api/nocodb/api/v2/tables/${NOCODB_TABLES.DECISIONS_KEYWORDS}/records?${params}`
  )
  if (!response.ok) throw new Error('Failed to fetch keyword-decision links')
  const data = await response.json()
  const ids = (data.list ?? []).map((r: Record<string, unknown>) => String(r.Decisions_id))
  return [...new Set(ids)] as string[]
}

const fetchDecisions = async (
  filters: Filters,
  langSuffix: LangSuffix,
  keywordIds: string[]
): Promise<NocoDBListResponse<Decision>> => {
  let decisionIds: string[] | undefined

  if (keywordIds.length > 0) {
    decisionIds = await fetchDecisionIdsForKeywords(keywordIds)
    if (decisionIds.length === 0) {
      return {
        list: [],
        pageInfo: { totalRows: 0, page: filters.page, pageSize: PAGE_SIZE, isFirstPage: true, isLastPage: true },
      }
    }
  }

  const qs = buildQueryString(filters, langSuffix, decisionIds)
  const response = await fetch(
    `/api/nocodb/api/v2/tables/${NOCODB_TABLES.DECISIONS}/records?${qs}`
  )
  if (!response.ok) throw new Error('Failed to fetch decisions')
  const data = await response.json()

  return {
    list: (data.list ?? []).map((r: Record<string, unknown>) => mapDecision(r, langSuffix)),
    pageInfo: data.pageInfo,
  }
}

export const useDecisions = (filters: Filters) => {
  const { langSuffix } = useLanguage()
  // For the dev callout: build both queries synchronously.
  // When keywords are active, step 1 queries the junction table and step 2
  // queries decisions with the resolved IDs (shown as a placeholder here).
  const nocodbQueries: string[] = filters.keywords.length > 0
    ? [
        `/api/v2/tables/${NOCODB_TABLES.DECISIONS_KEYWORDS}/records?` +
          new URLSearchParams({
            where: `(Keywords_id,in,${filters.keywords.join(',')})`,
            limit: '1000',
            fields: 'Decisions_id',
          }).toString(),
        `/api/v2/tables/${NOCODB_TABLES.DECISIONS}/records?` +
          buildQueryString(filters, langSuffix, ['<resolved Decisions_id>']),
      ]
    : [`/api/v2/tables/${NOCODB_TABLES.DECISIONS}/records?` + buildQueryString(filters, langSuffix)]

  const query = useQuery({
    queryKey: DECISIONS_QUERY_KEY(filters, langSuffix),
    queryFn: () => fetchDecisions(filters, langSuffix, filters.keywords),
    staleTime: 5 * 60 * 1000,
  })

  return { ...query, nocodbQueries }
}
