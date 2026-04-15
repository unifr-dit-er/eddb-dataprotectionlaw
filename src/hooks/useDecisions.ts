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

const buildQueryString = (filters: Filters, langSuffix: LangSuffix): string => {
  const params = new URLSearchParams()
  const conditions: string[] = []

  if (filters.q) conditions.push(`(Description${langSuffix},like,%${filters.q}%)`)
  if (filters.canton) conditions.push(`(Canton,eq,${filters.canton})`)
  if (filters.from) conditions.push(`(Date,gte,${filters.from})`)
  if (filters.to) conditions.push(`(Date,lte,${filters.to})`)
  // TODO: filtres catégories et mots-clés — à activer une fois les noms
  // des champs liés sur la table Decisions confirmés dans NocoDB
  // if (filters.categories.length > 0)
  //   conditions.push(`(NomDuChampCatégorie,in,${filters.categories.join(',')})`)
  // if (filters.keywords.length > 0)
  //   conditions.push(`(NomDuChampMotsClés,in,${filters.keywords.join(',')})`)

  if (conditions.length > 0) params.set('where', conditions.join('~and'))
  params.set('limit', '25')
  params.set('offset', String((filters.page - 1) * 25))
  params.set('sort', '-Date')

  return params.toString()
}

const fetchDecisions = async (
  filters: Filters,
  langSuffix: LangSuffix
): Promise<NocoDBListResponse<Decision>> => {
  const qs = buildQueryString(filters, langSuffix)
  const response = await fetch(
    `/api/nocodb/api/v2/tables/${NOCODB_TABLES.DECISIONS}/records?${qs}`
  )
  if (!response.ok) throw new Error('Failed to fetch decisions')
  const data = await response.json()
  return {
    list: (data.list ?? []).map((r: Record<string, unknown>) =>
      mapDecision(r, langSuffix)
    ),
    pageInfo: data.pageInfo,
  }
}

export const useDecisions = (filters: Filters) => {
  const { langSuffix } = useLanguage()
  return useQuery({
    queryKey: DECISIONS_QUERY_KEY(filters, langSuffix),
    queryFn: () => fetchDecisions(filters, langSuffix),
    staleTime: 5 * 60 * 1000,
  })
}
