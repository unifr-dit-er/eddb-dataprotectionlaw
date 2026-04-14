import type { Keyword } from '@/types/keyword'
import { useQuery } from '@tanstack/react-query'

export const KEYWORDS_QUERY_KEY = ['keywords'] as const

const fetchKeywords = async (): Promise<Keyword[]> => {
  const response = await fetch('/api/nocodb/keywords')
  if (!response.ok) throw new Error('Failed to fetch keywords')
  const data = await response.json()
  // NocoDB retourne { list: [...] }
  return (data.list ?? []) as Keyword[]
}

export const useKeywords = () => {
  return useQuery({
    queryKey: KEYWORDS_QUERY_KEY,
    queryFn: fetchKeywords,
    staleTime: 30 * 60 * 1000,
  })
}
