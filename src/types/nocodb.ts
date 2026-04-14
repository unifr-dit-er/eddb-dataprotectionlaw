export interface NocoDBPageInfo {
  totalRows: number
  page: number
  pageSize: number
  isFirstPage: boolean
  isLastPage: boolean
}

export interface NocoDBListResponse<T> {
  list: T[]
  pageInfo: NocoDBPageInfo
}
