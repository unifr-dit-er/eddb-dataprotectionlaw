import type { Decision } from '../decision'
import type { Filters } from '../filters'
import type { NocoDBListResponse } from '../nocodb'

describe('Types', () => {
  it('Decision type accepts a valid decision object', () => {
    const decision: Decision = {
      id: '1',
      title: 'Arrêt du Tribunal fédéral',
      abstract: 'Résumé de la décision.',
      canton: 'GE',
      date: '2024-03-15',
      keywords: [{ id: 'k1', label: 'Santé', category: 'Santé et sécurité sociale' }],
      pdfUrl: 'https://example.com/decision.pdf',
    }
    expect(decision.id).toBe('1')
  })

  it('Filters type has all required fields', () => {
    const filters: Filters = {
      q: '',
      canton: '',
      keywords: [],
      from: '',
      to: '',
      page: 1,
    }
    expect(filters.page).toBe(1)
  })

  it('NocoDBListResponse wraps a list with pageInfo', () => {
    const response: NocoDBListResponse<Decision> = {
      list: [],
      pageInfo: {
        totalRows: 0,
        page: 1,
        pageSize: 25,
        isFirstPage: true,
        isLastPage: true,
      },
    }
    expect(response.pageInfo.totalRows).toBe(0)
  })
})
