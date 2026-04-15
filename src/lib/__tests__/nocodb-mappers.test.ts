import { describe, it, expect } from 'vitest'
import { mapDecision, mapKeyword } from '../nocodb-mappers'

const baseRecord = {
  Id: '1',
  DescriptionFR: 'Titre FR',
  DescriptionDE: 'Titel DE',
  AbstractFR: 'Résumé FR',
  AbstractDE: 'Zusammenfassung DE',
  Canton: 'GE',
  Date: '2024-03-15',
  Attachment: [{ url: 'https://example.com/doc.pdf' }],
  // NocoDB exposes the m2m join under _nc_m2m_Decisions_Keywords;
  // `Keywords` is just a count and is ignored.
  Keywords: 0,
  _nc_m2m_Decisions_Keywords: [
    {
      Keywords_id: 42,
      Decisions_id: 1,
      Keywords: {
        Id: '42',
        KeywordFR: 'Mot-clé FR',
        KeywordDE: 'Stichwort DE',
        Category: { CategoryFR: 'Catégorie FR', CategoryDE: 'Kategorie DE' },
      },
    },
  ],
}

const baseKeyword = {
  Id: '42',
  KeywordFR: 'Mot-clé FR',
  KeywordDE: 'Stichwort DE',
  Category: { CategoryFR: 'Catégorie FR', CategoryDE: 'Kategorie DE' },
}

describe('mapDecision', () => {
  it('maps title and abstract using FR suffix', () => {
    const result = mapDecision(baseRecord, 'FR')
    expect(result.title).toBe('Titre FR')
    expect(result.abstract).toBe('Résumé FR')
  })

  it('maps title and abstract using DE suffix', () => {
    const result = mapDecision(baseRecord, 'DE')
    expect(result.title).toBe('Titel DE')
    expect(result.abstract).toBe('Zusammenfassung DE')
  })

  it('maps non-language fields correctly', () => {
    const result = mapDecision(baseRecord, 'FR')
    expect(result.id).toBe('1')
    expect(result.canton).toBe('GE')
    expect(result.date).toBe('2024-03-15')
    expect(result.pdfUrl).toBe('https://example.com/doc.pdf')
  })

  it('maps keywords from _nc_m2m_Decisions_Keywords', () => {
    const resultFR = mapDecision(baseRecord, 'FR')
    expect(resultFR.keywords).toHaveLength(1)
    expect(resultFR.keywords[0].id).toBe('42')
    expect(resultFR.keywords[0].label).toBe('Mot-clé FR')

    const resultDE = mapDecision(baseRecord, 'DE')
    expect(resultDE.keywords[0].label).toBe('Stichwort DE')
  })

  it('returns empty keywords when _nc_m2m_Decisions_Keywords is absent', () => {
    const result = mapDecision({ ...baseRecord, _nc_m2m_Decisions_Keywords: undefined }, 'FR')
    expect(result.keywords).toHaveLength(0)
  })
})

describe('mapKeyword', () => {
  it('maps label and category using FR suffix', () => {
    const result = mapKeyword(baseKeyword, 'FR')
    expect(result.label).toBe('Mot-clé FR')
    expect(result.category).toBe('Catégorie FR')
  })

  it('maps label and category using DE suffix', () => {
    const result = mapKeyword(baseKeyword, 'DE')
    expect(result.label).toBe('Stichwort DE')
    expect(result.category).toBe('Kategorie DE')
  })

  it('maps id correctly', () => {
    const result = mapKeyword(baseKeyword, 'FR')
    expect(result.id).toBe('42')
  })
})
