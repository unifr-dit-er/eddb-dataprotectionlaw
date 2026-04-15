import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useFilters } from '../useFilters'

// Mock next/navigation
const mockPush = vi.fn()
let mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
}))

describe('useFilters', () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams()
    mockPush.mockClear()
  })

  it('returns default filters when URL has no params', () => {
    const { result } = renderHook(() => useFilters())
    expect(result.current.filters).toEqual({
      q: '',
      canton: '',
      keywords: [],
      from: '',
      to: '',
      page: 1,
    })
  })

  it('reads q from URL params', () => {
    mockSearchParams = new URLSearchParams('q=santé')
    const { result } = renderHook(() => useFilters())
    expect(result.current.filters.q).toBe('santé')
  })

  it('setFilter updates a single param and resets page to 1', () => {
    const { result } = renderHook(() => useFilters())
    act(() => {
      result.current.setFilter('canton', 'GE')
    })
    const calledUrl = mockPush.mock.calls[0][0] as string
    expect(calledUrl).toContain('canton=GE')
    expect(calledUrl).not.toContain('page=')
  })

  it('resetFilters clears all filter params', () => {
    mockSearchParams = new URLSearchParams('q=test&canton=GE&page=3')
    const { result } = renderHook(() => useFilters())
    act(() => {
      result.current.resetFilters()
    })
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('reads keywords as array', () => {
    mockSearchParams = new URLSearchParams('keyword=1&keyword=2')
    const { result } = renderHook(() => useFilters())
    expect(result.current.filters.keywords).toEqual(['1', '2'])
  })
})
