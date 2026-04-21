import type { Decision } from '@/types/decision'
import type { Keyword } from '@/types/keyword'
import type { LangSuffix } from '@/i18n'

type NocoDBRecord = Record<string, unknown>
type NocoDBAttachment = { url?: string; signedPath?: string }

export const mapDecision = (record: NocoDBRecord, langSuffix: LangSuffix): Decision => {
  const attachments = Array.isArray(record.Attachment)
    ? (record.Attachment as NocoDBAttachment[])
    : []

  // NocoDB exposes the many-to-many join as `_nc_m2m_Decisions_Keywords`.
  // `record.Keywords` is just a count (e.g. 2), not the linked records.
  const m2mEntries = Array.isArray(record._nc_m2m_Decisions_Keywords)
    ? (record._nc_m2m_Decisions_Keywords as NocoDBRecord[])
    : []

  return {
    id: String(record.Id ?? record.id ?? ''),
    title: String(record[`Description${langSuffix}`] ?? ''),
    abstract: String(record[`Abstract${langSuffix}`] ?? ''),
    canton: String(record.Canton ?? ''),
    date: String(record.Date ?? '').slice(0, 10),
    keywords: m2mEntries
      .filter((entry) => entry.Keywords != null)
      .map((entry) => mapKeyword(entry.Keywords as NocoDBRecord, langSuffix)),
    pdfUrl: attachments[0]?.url ?? (attachments[0]?.signedPath
      ? `${process.env.NEXT_PUBLIC_NOCODB_API_URL?.replace(/\/$/, '') ?? ''}/${attachments[0].signedPath}`
      : ''),
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
    decisionsCount: typeof record.Decisions === 'number' ? record.Decisions : 0,
  }
}
