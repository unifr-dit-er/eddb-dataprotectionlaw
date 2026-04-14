import type { Keyword } from '@/types/keyword'
import { useQuery } from '@tanstack/react-query'
import { NOCODB_TABLES } from '@/lib/nocodb-tables'
import { mapKeyword } from '@/lib/nocodb-mappers'

export const KEYWORDS_QUERY_KEY = ['keywords'] as const

type NocoDBRecord = Record<string, unknown>

const fetchKeywords = async (): Promise<Keyword[]> => {
  // Récupère les mots-clés et les catégories en parallèle
  const [kwResp, catResp] = await Promise.all([
    fetch(`/api/nocodb/api/v2/tables/${NOCODB_TABLES.KEYWORDS}/records?limit=1000`),
    fetch(`/api/nocodb/api/v2/tables/${NOCODB_TABLES.CATEGORIES}/records?limit=200`),
  ])
  if (!kwResp.ok) throw new Error('Failed to fetch keywords')
  if (!catResp.ok) throw new Error('Failed to fetch categories')

  const kwData = await kwResp.json()
  const catData = await catResp.json()

  // Construit un dictionnaire id → label pour les catégories (champ : CategoryFR)
  const categoryMap = new Map<string, string>()
  ;(catData.list ?? []).forEach((cat: NocoDBRecord) => {
    const id = String(cat.Id ?? cat.id ?? '')
    const label = String(cat.CategoryFR ?? '')
    if (id) categoryMap.set(id, label)
  })

  return (kwData.list ?? []).map((record: NocoDBRecord): Keyword => {
    const kw = mapKeyword(record)
    // Si la catégorie n'a pas été résolue inline par NocoDB, tenter via le dictionnaire
    if (!kw.category) {
      const catId = String(record.CategoriesId ?? record.CategoryId ?? record.fk_categories ?? '')
      kw.category = categoryMap.get(catId) ?? ''
    }
    return kw
  })
}

export const useKeywords = () => {
  return useQuery({
    queryKey: KEYWORDS_QUERY_KEY,
    queryFn: fetchKeywords,
    staleTime: 30 * 60 * 1000,
  })
}
