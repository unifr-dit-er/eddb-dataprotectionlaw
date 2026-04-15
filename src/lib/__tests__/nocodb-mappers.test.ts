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
  Keywords: [],
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
