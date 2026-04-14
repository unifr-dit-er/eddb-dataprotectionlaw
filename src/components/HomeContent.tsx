'use client'

import DecisionList from '@/components/DecisionList'
import DecisionPanel from '@/components/DecisionPanel'
import FilterSidebar from '@/components/FilterSidebar'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const HomeContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const decisionId = searchParams.get('decision')

  const closePanel = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('decision')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }, [searchParams, router, pathname])

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-72 shrink-0 border-r p-4 overflow-y-auto">
        <h1 className="text-sm font-semibold mb-4 text-foreground">
          Décisions · Protection des données
        </h1>
        <FilterSidebar />
      </div>
      <main className="flex-1 p-4 overflow-y-auto">
        <DecisionList />
      </main>
      <DecisionPanel decisionId={decisionId} onClose={closePanel} />
    </div>
  )
}

export default HomeContent
