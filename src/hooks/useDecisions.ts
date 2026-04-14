import type { Filters } from '@/types/filters'
import type { Decision } from '@/types/decision'
import type { NocoDBListResponse } from '@/types/nocodb'
import { useQuery } from '@tanstack/react-query'

export const DECISIONS_QUERY_KEY = (filters: Filters) => ['decisions', filters] as const

const buildQueryString = (filters: Filters): string => {
  const params = new URLSearchParams()
  const conditions: string[] = []

  if (filters.q) conditions.push(`(title,like,%${filters.q}%)`)
  if (filters.canton) conditions.push(`(canton,eq,${filters.canton})`)
  if (filters.from) conditions.push(`(date,gte,${filters.from})`)
  if (filters.to) conditions.push(`(date,lte,${filters.to})`)
  if (filters.categories.length > 0)
    conditions.push(`(category,in,${filters.categories.join(',')})`)
  if (filters.keywords.length > 0)
    conditions.push(`(keyword_ids,in,${filters.keywords.join(',')})`)

  if (conditions.length > 0) params.set('where', conditions.join('~and'))

  params.set('limit', '25')
  params.set('offset', String((filters.page - 1) * 25))
  params.set('sort', '-date')

  return params.toString()
}

const fetchDecisions = async (filters: Filters): Promise<NocoDBListResponse<Decision>> => {
  const qs = buildQueryString(filters)
  const response = await fetch(`/api/nocodb/decisions?${qs}`)
  if (!response.ok) throw new Error('Failed to fetch decisions')
  return response.json()
}

export const useDecisions = (filters: Filters) => {
  return useQuery({
    queryKey: DECISIONS_QUERY_KEY(filters),
    queryFn: () => fetchDecisions(filters),
    staleTime: 5 * 60 * 1000,
  })
}
