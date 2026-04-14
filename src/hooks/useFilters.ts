'use client'

import { DEFAULT_FILTERS, type Filters } from '@/types/filters'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export const useFilters = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters: Filters = {
    q: searchParams.get('q') ?? '',
    canton: searchParams.get('canton') ?? '',
    categories: searchParams.getAll('category'),
    keywords: searchParams.getAll('keyword'),
    from: searchParams.get('from') ?? '',
    to: searchParams.get('to') ?? '',
    page: Number(searchParams.get('page') ?? '1'),
  }

  const setFilter = useCallback(
    (key: keyof Filters, value: string | string[] | number) => {
      const params = new URLSearchParams(searchParams.toString())

      // Reset page when changing any filter
      params.delete('page')

      const paramName =
        key === 'categories' ? 'category' : key === 'keywords' ? 'keyword' : key

      if (Array.isArray(value)) {
        params.delete(paramName)
        value.forEach((v) => params.append(paramName, v))
      } else if (value === '' || value === 0) {
        params.delete(paramName)
      } else {
        params.set(paramName, String(value))
      }

      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  const resetFilters = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  return { filters, setFilter, resetFilters }
}

// Re-export DEFAULT_FILTERS for convenience (not used in hook body but available)
export { DEFAULT_FILTERS }
