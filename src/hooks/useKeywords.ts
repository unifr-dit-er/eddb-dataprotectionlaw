import type { Keyword } from '@/types/keyword'
import type { LangSuffix } from '@/i18n'
import { useQuery } from '@tanstack/react-query'
import { NOCODB_TABLES } from '@/lib/nocodb-tables'
import { mapKeyword } from '@/lib/nocodb-mappers'
import { useLanguage } from '@/contexts/LanguageContext'

export const KEYWORDS_QUERY_KEY = (langSuffix: LangSuffix) =>
  ['keywords', langSuffix] as const

type NocoDBRecord = Record<string, unknown>

const fetchKeywords = async (langSuffix: LangSuffix): Promise<Keyword[]> => {
  const [kwResp, catResp] = await Promise.all([
    fetch(`/api/nocodb/api/v2/tables/${NOCODB_TABLES.KEYWORDS}/records?limit=1000`),
    fetch(`/api/nocodb/api/v2/tables/${NOCODB_TABLES.CATEGORIES}/records?limit=200`),
  ])
  if (!kwResp.ok) throw new Error('Failed to fetch keywords')
  if (!catResp.ok) throw new Error('Failed to fetch categories')

  const kwData = await kwResp.json()
  const catData = await catResp.json()

  const categoryMap = new Map<string, string>()
  ;(catData.list ?? []).forEach((cat: NocoDBRecord) => {
    const id = String(cat.Id ?? cat.id ?? '')
    const label = String(cat[`Category${langSuffix}`] ?? '')
    if (id) categoryMap.set(id, label)
  })

  return (kwData.list ?? []).map((record: NocoDBRecord): Keyword => {
    const kw = mapKeyword(record, langSuffix)
    if (!kw.category) {
      // NocoDB linked fields often only include the primary field (e.g. CategoryDE),
      // so CategoryFR may be absent. Extract the linked record's Id to look up the
      // correct label from the separately-fetched categoryMap.
      const categoryField = record.Category ?? record.Categories
      const linkedId = Array.isArray(categoryField) && categoryField.length > 0
        ? String((categoryField[0] as NocoDBRecord).Id ?? (categoryField[0] as NocoDBRecord).id ?? '')
        : typeof categoryField === 'object' && categoryField !== null
        ? String((categoryField as NocoDBRecord).Id ?? (categoryField as NocoDBRecord).id ?? '')
        : ''
      const catId = linkedId
        || String(record.CategoriesId ?? record.CategoryId ?? record.fk_categories ?? '')
      kw.category = categoryMap.get(catId) ?? ''
    }
    return kw
  })
}

export const useKeywords = () => {
  const { langSuffix } = useLanguage()
  return useQuery({
    queryKey: KEYWORDS_QUERY_KEY(langSuffix),
    queryFn: () => fetchKeywords(langSuffix),
    staleTime: 30 * 60 * 1000,
  })
}
