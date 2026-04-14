export interface Filters {
  q: string
  canton: string
  categories: string[]
  keywords: string[]
  from: string
  to: string
  page: number
}

export const DEFAULT_FILTERS: Filters = {
  q: '',
  canton: '',
  categories: [],
  keywords: [],
  from: '',
  to: '',
  page: 1,
}
