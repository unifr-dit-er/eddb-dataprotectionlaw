import type { Decision } from '@/types/decision'
import type { Keyword } from '@/types/keyword'
import type { LangSuffix } from '@/i18n'

type NocoDBRecord = Record<string, unknown>
type NocoDBAttachment = { url?: string; path?: string }

export const mapDecision = (record: NocoDBRecord, langSuffix: LangSuffix): Decision => {
  const attachments = Array.isArray(record.Attachment)
    ? (record.Attachment as NocoDBAttachment[])
    : []

  const linkedKeywords = Array.isArray(record.Keywords)
    ? (record.Keywords as NocoDBRecord[])
    : []

  return {
    id: String(record.Id ?? record.id ?? ''),
    title: String(record[`Description${langSuffix}`] ?? ''),
    abstract: String(record[`Abstract${langSuffix}`] ?? ''),
    canton: String(record.Canton ?? ''),
    date: String(record.Date ?? '').slice(0, 10),
    keywords: linkedKeywords.map((kw) => mapKeyword(kw, langSuffix)),
    pdfUrl: attachments[0]?.url ?? attachments[0]?.path ?? '',
  }
}

export const mapKeyword = (record: NocoDBRecord, langSuffix: LangSuffix): Keyword => {
  const categoryField = record.Category ?? record.Categories
  const categoryLabel =
    typeof categoryField === 'object' && categoryField !== null
      ? String((categoryField as NocoDBRecord)[`Category${langSuffix}`] ?? '')
      : String(categoryField ?? '')

  return {
    id: String(record.Id ?? record.id ?? ''),
    label: String(record[`Keyword${langSuffix}`] ?? ''),
    category: categoryLabel,
  }
}
