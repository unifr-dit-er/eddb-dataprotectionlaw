export interface Filters {
  q: string
  canton: string
  keywords: string[]
  from: string
  to: string
  page: number
}

export const DEFAULT_FILTERS: Filters = {
  q: '',
  canton: '',
  keywords: [],
  from: '',
  to: '',
  page: 1,
}
