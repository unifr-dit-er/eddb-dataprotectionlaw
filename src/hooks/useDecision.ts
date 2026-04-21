import type { Decision } from '@/types/decision'
import type { LangSuffix } from '@/i18n'
import { useQuery } from '@tanstack/react-query'
import { NOCODB_TABLES } from '@/lib/nocodb-tables'
import { mapDecision } from '@/lib/nocodb-mappers'
import { apiFetch } from '@/lib/api-fetch'
import { useLanguage } from '@/contexts/LanguageContext'

export const DECISION_QUERY_KEY = (id: string | null, langSuffix: LangSuffix) =>
  ['decision', id, langSuffix] as const

const fetchDecision = async (id: string, langSuffix: LangSuffix): Promise<Decision> => {
  const response = await apiFetch(
    `/api/nocodb/api/v2/tables/${NOCODB_TABLES.DECISIONS}/records/${id}`
  )
  if (!response.ok) throw new Error(`Failed to fetch decision ${id}`)
  const data = await response.json()
  return mapDecision(data, langSuffix)
}

export const useDecision = (id: string | null) => {
  const { langSuffix } = useLanguage()
  return useQuery({
    queryKey: DECISION_QUERY_KEY(id, langSuffix),
    queryFn: () => fetchDecision(id!, langSuffix),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  })
}
