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
      const catId = String(
        record.CategoriesId ?? record.CategoryId ?? record.fk_categories ?? ''
      )
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
