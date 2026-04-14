import type { Keyword } from './keyword'

export interface Decision {
  id: string
  title: string
  abstract: string
  canton: string
  date: string
  keywords: Keyword[]
  pdfUrl: string
}
