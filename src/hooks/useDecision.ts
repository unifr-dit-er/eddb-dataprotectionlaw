import type { Decision } from '@/types/decision'
import { useQuery } from '@tanstack/react-query'
import { NOCODB_TABLES } from '@/lib/nocodb-tables'
import { mapDecision } from '@/lib/nocodb-mappers'

export const DECISION_QUERY_KEY = (id: string | null) => ['decision', id] as const

const fetchDecision = async (id: string): Promise<Decision> => {
  const response = await fetch(
    `/api/nocodb/api/v2/tables/${NOCODB_TABLES.DECISIONS}/records/${id}`
  )
  if (!response.ok) throw new Error(`Failed to fetch decision ${id}`)
  const data = await response.json()
  return mapDecision(data)
}

export const useDecision = (id: string | null) => {
  return useQuery({
    queryKey: DECISION_QUERY_KEY(id),
    queryFn: () => fetchDecision(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  })
}
