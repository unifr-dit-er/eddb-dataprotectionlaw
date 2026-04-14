import type { Decision } from '@/types/decision'
import type { Keyword } from '@/types/keyword'

type NocoDBRecord = Record<string, unknown>
type NocoDBAttachment = { url?: string; path?: string }

/**
 * Transforme un enregistrement NocoDB brut en Decision typée.
 * Noms de colonnes NocoDB : DescriptionFR, AbstractFR, Canton, Date, Attachment
 *
 * TODO: remplacer 'Keywords' par le nom exact du champ lié dans NocoDB
 * (le nom du champ "Link to another record" sur la table Decisions)
 */
export const mapDecision = (record: NocoDBRecord): Decision => {
  const attachments = Array.isArray(record.Attachment)
    ? (record.Attachment as NocoDBAttachment[])
    : []

  // Nom du champ lié aux mots-clés sur la table Decisions
  // À adapter selon le nom réel dans NocoDB (ex: 'Keywords', 'Mots-clés', 'Tags'…)
  const linkedKeywords = Array.isArray(record.Keywords)
    ? (record.Keywords as NocoDBRecord[])
    : []

  return {
    id: String(record.Id ?? record.id ?? ''),
    title: String(record.DescriptionFR ?? ''),
    abstract: String(record.AbstractFR ?? ''),
    canton: String(record.Canton ?? ''),
    date: String(record.Date ?? '').slice(0, 10), // garde uniquement YYYY-MM-DD
    keywords: linkedKeywords.map(mapKeyword),
    pdfUrl: attachments[0]?.url ?? attachments[0]?.path ?? '',
  }
}

/**
 * Transforme un enregistrement NocoDB brut en Keyword typé.
 * TODO: vérifier les noms de colonnes réels dans la table Keywords de NocoDB
 */
export const mapKeyword = (record: NocoDBRecord): Keyword => {
  // La catégorie peut être un objet lié (Many-to-One NocoDB) ou une chaîne
  const categoryField = record.Category ?? record.Categories ?? record.Catégorie
  const categoryLabel =
    typeof categoryField === 'object' && categoryField !== null
      ? String(
          (categoryField as NocoDBRecord).Title ??
            (categoryField as NocoDBRecord).Name ??
            (categoryField as NocoDBRecord).Titre ??
            ''
        )
      : String(categoryField ?? '')

  return {
    id: String(record.Id ?? record.id ?? ''),
    // TODO: vérifier le nom exact du champ label dans la table Keywords
    label: String(record.Title ?? record.Label ?? record.Titre ?? record.Name ?? ''),
    category: categoryLabel,
  }
}
