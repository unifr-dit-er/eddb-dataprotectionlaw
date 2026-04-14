import type { Filters } from '@/types/filters'
import type { Decision } from '@/types/decision'
import type { NocoDBListResponse } from '@/types/nocodb'
import { useQuery } from '@tanstack/react-query'
import { NOCODB_TABLES } from '@/lib/nocodb-tables'
import { mapDecision } from '@/lib/nocodb-mappers'

export const DECISIONS_QUERY_KEY = (filters: Filters) => ['decisions', filters] as const

const buildQueryString = (filters: Filters): string => {
  const params = new URLSearchParams()
  const conditions: string[] = []

  if (filters.q) conditions.push(`(DescriptionFR,like,%${filters.q}%)`)
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

const fetchDecisions = async (filters: Filters): Promise<NocoDBListResponse<Decision>> => {
  const qs = buildQueryString(filters)
  const response = await fetch(
    `/api/nocodb/api/v2/tables/${NOCODB_TABLES.DECISIONS}/records?${qs}`
  )
  if (!response.ok) throw new Error('Failed to fetch decisions')
  const data = await response.json()
  return {
    list: (data.list ?? []).map(mapDecision),
    pageInfo: data.pageInfo,
  }
}

export const useDecisions = (filters: Filters) => {
  return useQuery({
    queryKey: DECISIONS_QUERY_KEY(filters),
    queryFn: () => fetchDecisions(filters),
    staleTime: 5 * 60 * 1000,
  })
}
