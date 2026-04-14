import type { Filters } from '@/types/filters'
import type { Decision } from '@/types/decision'
import type { NocoDBListResponse } from '@/types/nocodb'
import { useQuery } from '@tanstack/react-query'

export const DECISIONS_QUERY_KEY = (filters: Filters) => ['decisions', filters] as const

const buildQueryString = (filters: Filters): string => {
  const params = new URLSearchParams()

  if (filters.q) params.set('where', `(title,like,%${filters.q}%)`)
  if (filters.canton) params.set('where', `(canton,eq,${filters.canton})`)
  if (filters.from) params.set('where', `(date,gte,${filters.from})`)
  if (filters.to) params.set('where', `(date,lte,${filters.to})`)
  if (filters.categories.length > 0)
    params.set('where', `(category,in,${filters.categories.join(',')})`)

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
