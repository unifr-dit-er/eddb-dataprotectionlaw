# Dashboard Décisions Protection des Données — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire un dashboard read-only listant des décisions juridiques suisses sur la protection des données, avec filtres persistants, panneau de détail, et état 100% encodé dans l'URL.

**Architecture:** Layout 3 colonnes (sidebar filtres / liste / panneau détail). Toutes les données viennent de NocoDB via un proxy Next.js. TanStack Query gère le cache client. L'état des filtres et de la décision ouverte vit dans les search params de l'URL.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query v5, Vitest, @testing-library/react

---

## File Map

| Fichier | Rôle |
|---|---|
| `src/types/decision.ts` | Interface `Decision` |
| `src/types/keyword.ts` | Interface `Keyword` |
| `src/types/filters.ts` | Interface `Filters` |
| `src/types/nocodb.ts` | Types réponse NocoDB |
| `src/lib/cantons.ts` | Liste fixe des 26 cantons |
| `src/lib/nocodb.ts` | Client NocoDB (route handlers uniquement) |
| `src/lib/utils.ts` | `cn()` (généré par shadcn) |
| `src/app/api/nocodb/[...path]/route.ts` | Proxy GET générique vers NocoDB |
| `src/app/layout.tsx` | Root layout + `QueryClientProvider` |
| `src/app/page.tsx` | Page principale (thin wrapper) |
| `src/hooks/useFilters.ts` | Lecture/écriture des search params |
| `src/hooks/useKeywords.ts` | Chargement mots-clés + catégories |
| `src/hooks/useDecisions.ts` | Liste paginée avec filtres |
| `src/hooks/useDecision.ts` | Détail d'une décision |
| `src/components/FilterSidebar.tsx` | Colonne gauche — tous les filtres |
| `src/components/DecisionCard.tsx` | Card cliquable dans la liste |
| `src/components/DecisionList.tsx` | Liste + pagination + états vide/chargement |
| `src/components/DecisionPanel.tsx` | Panneau droit (Sheet shadcn) |
| `src/components/Providers.tsx` | Client component wrappant QueryClientProvider |
| `vitest.config.ts` | Config Vitest |
| `vitest.setup.ts` | Setup testing-library |

---

## Task 1: Scaffolding du projet Next.js 15

**Files:**
- Create: `package.json` (via CLI)
- Create: `.env.local`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Initialiser le projet**

Depuis le répertoire du dépôt (qui contient déjà `CLAUDE.md`) :

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git \
  --yes
```

Répondre "yes" si on demande d'écraser des fichiers existants (seuls `.git` et `CLAUDE.md` existent).

- [ ] **Step 2: Installer TanStack Query v5**

```bash
npm install @tanstack/react-query
```

- [ ] **Step 3: Créer `.env.local`**

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_NOCODB_API_URL=http://localhost:8080
NOCODB_API_TOKEN=your-token-here
EOF
```

- [ ] **Step 4: Vérifier que le projet démarre**

```bash
npm run dev
```

Attendu : serveur sur `http://localhost:3000`, pas d'erreurs dans la console.

Arrêter le serveur (`Ctrl+C`).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 project with TypeScript and Tailwind"
```

---

## Task 2: Configuration de Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json`

- [ ] **Step 1: Installer les dépendances de test**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

- [ ] **Step 2: Créer `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Créer `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Ajouter le script de test dans `package.json`**

Dans la section `"scripts"`, ajouter :

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Vérifier que vitest fonctionne**

```bash
npm test
```

Attendu : `No test files found` (ou 0 tests passés). Pas d'erreurs de configuration.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts vitest.setup.ts package.json package-lock.json
git commit -m "chore: configure vitest with jsdom and testing-library"
```

---

## Task 3: Types TypeScript partagés

**Files:**
- Create: `src/types/decision.ts`
- Create: `src/types/keyword.ts`
- Create: `src/types/filters.ts`
- Create: `src/types/nocodb.ts`

- [ ] **Step 1: Écrire les tests**

Créer `src/types/__tests__/types.test.ts` :

```ts
import type { Decision } from '../decision'
import type { Keyword } from '../keyword'
import type { Filters } from '../filters'
import type { NocoDBListResponse } from '../nocodb'

// Ces tests vérifient que les types compilent correctement
// et que les objets example sont bien typés.

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
      categories: [],
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
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

```bash
npm test
```

Attendu : erreurs d'import (les types n'existent pas encore).

- [ ] **Step 3: Créer `src/types/keyword.ts`**

```ts
export interface Keyword {
  id: string
  label: string
  category: string
}
```

- [ ] **Step 4: Créer `src/types/decision.ts`**

```ts
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
```

- [ ] **Step 5: Créer `src/types/filters.ts`**

```ts
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
```

- [ ] **Step 6: Créer `src/types/nocodb.ts`**

```ts
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
```

- [ ] **Step 7: Lancer les tests pour vérifier qu'ils passent**

```bash
npm test
```

Attendu : 3 tests passés.

- [ ] **Step 8: Commit**

```bash
git add src/types/
git commit -m "feat: add shared TypeScript types (Decision, Keyword, Filters, NocoDB)"
```

---

## Task 4: lib/cantons.ts

**Files:**
- Create: `src/lib/cantons.ts`
- Create: `src/lib/__tests__/cantons.test.ts`

- [ ] **Step 1: Écrire les tests**

Créer `src/lib/__tests__/cantons.test.ts` :

```ts
import { CANTONS, getCantonLabel } from '../cantons'

describe('cantons', () => {
  it('contains exactly 26 cantons', () => {
    expect(CANTONS).toHaveLength(26)
  })

  it('each canton has a code and a label', () => {
    CANTONS.forEach((c) => {
      expect(c.code).toBeTruthy()
      expect(c.label).toBeTruthy()
    })
  })

  it('getCantonLabel returns the label for a known code', () => {
    expect(getCantonLabel('GE')).toBe('Genève')
  })

  it('getCantonLabel returns the code if unknown', () => {
    expect(getCantonLabel('XX')).toBe('XX')
  })
})
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

```bash
npm test
```

Attendu : erreurs d'import.

- [ ] **Step 3: Créer `src/lib/cantons.ts`**

```ts
export interface Canton {
  code: string
  label: string
}

export const CANTONS: Canton[] = [
  { code: 'AG', label: 'Argovie' },
  { code: 'AI', label: 'Appenzell Rhodes-Intérieures' },
  { code: 'AR', label: 'Appenzell Rhodes-Extérieures' },
  { code: 'BE', label: 'Berne' },
  { code: 'BL', label: 'Bâle-Campagne' },
  { code: 'BS', label: 'Bâle-Ville' },
  { code: 'FR', label: 'Fribourg' },
  { code: 'GE', label: 'Genève' },
  { code: 'GL', label: 'Glaris' },
  { code: 'GR', label: 'Grisons' },
  { code: 'JU', label: 'Jura' },
  { code: 'LU', label: 'Lucerne' },
  { code: 'NE', label: 'Neuchâtel' },
  { code: 'NW', label: 'Nidwald' },
  { code: 'OW', label: 'Obwald' },
  { code: 'SG', label: 'Saint-Gall' },
  { code: 'SH', label: 'Schaffhouse' },
  { code: 'SO', label: 'Soleure' },
  { code: 'SZ', label: 'Schwytz' },
  { code: 'TG', label: 'Thurgovie' },
  { code: 'TI', label: 'Tessin' },
  { code: 'UR', label: 'Uri' },
  { code: 'VD', label: 'Vaud' },
  { code: 'VS', label: 'Valais' },
  { code: 'ZG', label: 'Zoug' },
  { code: 'ZH', label: 'Zurich' },
]

export const getCantonLabel = (code: string): string => {
  return CANTONS.find((c) => c.code === code)?.label ?? code
}
```

- [ ] **Step 4: Lancer les tests pour vérifier qu'ils passent**

```bash
npm test
```

Attendu : 4 tests passés.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cantons.ts src/lib/__tests__/cantons.test.ts
git commit -m "feat: add cantons list with 26 Swiss cantons"
```

---

## Task 5: lib/nocodb.ts

**Files:**
- Create: `src/lib/nocodb.ts`
- Create: `src/lib/__tests__/nocodb.test.ts`

- [ ] **Step 1: Écrire les tests**

Créer `src/lib/__tests__/nocodb.test.ts` :

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchNocoDB } from '../nocodb'

describe('fetchNocoDB', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_NOCODB_API_URL', 'http://localhost:8080')
    vi.stubEnv('NOCODB_API_TOKEN', 'test-token')
    vi.stubGlobal('fetch', vi.fn())
  })

  it('calls the correct URL with auth header', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ list: [], pageInfo: {} }),
    } as Response)

    await fetchNocoDB('/api/v1/db/data/noco/decisions')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/db/data/noco/decisions',
      expect.objectContaining({
        headers: expect.objectContaining({ 'xc-auth': 'test-token' }),
      })
    )
  })

  it('appends query params when provided', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response)

    await fetchNocoDB('/api/v1/db/data/noco/decisions', { where: '(canton,eq,GE)', limit: '25' })

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('where=%28canton%2Ceq%2CGE%29')
    expect(calledUrl).toContain('limit=25')
  })

  it('throws when response is not ok', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as Response)

    await expect(fetchNocoDB('/api/v1/db/data/noco/decisions')).rejects.toThrow('NocoDB error: 401')
  })
})
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

```bash
npm test
```

Attendu : erreurs d'import.

- [ ] **Step 3: Créer `src/lib/nocodb.ts`**

```ts
/**
 * NocoDB API client.
 * À utiliser UNIQUEMENT dans les route handlers (src/app/api/).
 * Ne jamais importer ce fichier dans des composants ou des hooks.
 */
export const fetchNocoDB = async (
  path: string,
  params?: Record<string, string>
): Promise<unknown> => {
  const baseUrl = process.env.NEXT_PUBLIC_NOCODB_API_URL
  const token = process.env.NOCODB_API_TOKEN

  const url = new URL(path, baseUrl)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  const response = await fetch(url.toString(), {
    headers: {
      'xc-auth': token ?? '',
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`NocoDB error: ${response.status}`)
  }

  return response.json()
}
```

- [ ] **Step 4: Lancer les tests pour vérifier qu'ils passent**

```bash
npm test
```

Attendu : 3 tests passés dans `nocodb.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/nocodb.ts src/lib/__tests__/nocodb.test.ts
git commit -m "feat: add NocoDB client utility"
```

---

## Task 6: Proxy NocoDB route handler

**Files:**
- Create: `src/app/api/nocodb/[...path]/route.ts`

- [ ] **Step 1: Créer `src/app/api/nocodb/[...path]/route.ts`**

```ts
import { fetchNocoDB } from '@/lib/nocodb'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) => {
  const { path } = await params
  const nocdbPath = '/' + path.join('/')

  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries())

  try {
    const data = await fetchNocoDB(nocdbPath, searchParams)
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

- [ ] **Step 2: Vérifier manuellement que la route répond**

Démarrer le serveur :

```bash
npm run dev
```

Dans un autre terminal :

```bash
curl http://localhost:3000/api/nocodb/api/v1/db/data/noco/test
```

Attendu : réponse JSON (erreur NocoDB ou données selon la config), pas de crash 500 de Next.js.

Arrêter le serveur.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/nocodb/
git commit -m "feat: add NocoDB proxy route handler"
```

---

## Task 7: Installation shadcn/ui et composants

**Files:**
- Create: `src/components/ui/` (générés par shadcn)
- Modify: `src/lib/utils.ts` (généré par shadcn)
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Initialiser shadcn**

```bash
npx shadcn@latest init --defaults
```

Choisir : style Default, base color Neutral, CSS variables: yes.

- [ ] **Step 2: Ajouter les composants nécessaires**

```bash
npx shadcn@latest add sheet badge button input checkbox select skeleton separator
```

- [ ] **Step 3: Vérifier la présence des composants**

```bash
ls src/components/ui/
```

Attendu : `sheet.tsx badge.tsx button.tsx input.tsx checkbox.tsx select.tsx skeleton.tsx separator.tsx` (et `utils.ts` dans `src/lib/`).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/ src/lib/utils.ts tailwind.config.ts src/app/globals.css components.json
git commit -m "chore: initialize shadcn/ui with required components"
```

---

## Task 8: QueryClientProvider

**Files:**
- Create: `src/components/Providers.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Créer `src/components/Providers.tsx`**

```tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export default Providers
```

- [ ] **Step 2: Modifier `src/app/layout.tsx` pour utiliser Providers**

Remplacer le contenu de `src/app/layout.tsx` par :

```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Décisions — Protection des données',
  description: 'Décisions juridiques suisses sur la protection des données',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Vérifier que le projet compile**

```bash
npm run build
```

Attendu : build réussi sans erreurs TypeScript.

- [ ] **Step 4: Commit**

```bash
git add src/components/Providers.tsx src/app/layout.tsx
git commit -m "feat: configure TanStack Query with QueryClientProvider"
```

---

## Task 9: useFilters hook

**Files:**
- Create: `src/hooks/useFilters.ts`
- Create: `src/hooks/__tests__/useFilters.test.ts`

- [ ] **Step 1: Écrire les tests**

Créer `src/hooks/__tests__/useFilters.test.ts` :

```ts
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
      categories: [],
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

  it('reads categories as array', () => {
    mockSearchParams = new URLSearchParams('category=Santé&category=Travail')
    const { result } = renderHook(() => useFilters())
    expect(result.current.filters.categories).toEqual(['Santé', 'Travail'])
  })
})
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

```bash
npm test
```

Attendu : erreurs d'import.

- [ ] **Step 3: Créer `src/hooks/useFilters.ts`**

```ts
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
```

- [ ] **Step 4: Lancer les tests pour vérifier qu'ils passent**

```bash
npm test
```

Attendu : 5 tests passés dans `useFilters.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useFilters.ts src/hooks/__tests__/useFilters.test.ts
git commit -m "feat: add useFilters hook syncing filter state with URL params"
```

---

## Task 10: useKeywords hook

**Files:**
- Create: `src/hooks/useKeywords.ts`

- [ ] **Step 1: Créer `src/hooks/useKeywords.ts`**

```ts
import type { Keyword } from '@/types/keyword'
import { useQuery } from '@tanstack/react-query'

export const KEYWORDS_QUERY_KEY = ['keywords'] as const

const fetchKeywords = async (): Promise<Keyword[]> => {
  const response = await fetch('/api/nocodb/keywords')
  if (!response.ok) throw new Error('Failed to fetch keywords')
  const data = await response.json()
  // NocoDB retourne { list: [...] }
  return (data.list ?? []) as Keyword[]
}

export const useKeywords = () => {
  return useQuery({
    queryKey: KEYWORDS_QUERY_KEY,
    queryFn: fetchKeywords,
    staleTime: 30 * 60 * 1000,
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useKeywords.ts
git commit -m "feat: add useKeywords hook"
```

---

## Task 11: useDecisions hook

**Files:**
- Create: `src/hooks/useDecisions.ts`

- [ ] **Step 1: Créer `src/hooks/useDecisions.ts`**

```ts
import type { Filters } from '@/types/filters'
import type { Decision } from '@/types/decision'
import type { NocoDBListResponse } from '@/types/nocodb'
import { useQuery } from '@tanstack/react-query'

export const DECISIONS_QUERY_KEY = (filters: Filters) => ['decisions', filters] as const

const buildQueryString = (filters: Filters): string => {
  const params = new URLSearchParams()

  if (filters.q) params.set('where', `(title,like,%${filters.q}%)`)
  if (filters.canton) params.set('where', `(canton,eq,${filters.canton})`)
  if (filters.from) params.set('where', `(date,gte,${filters.from})`)
  if (filters.to) params.set('where', `(date,lte,${filters.to})`)
  if (filters.categories.length > 0)
    params.set('where', `(category,in,${filters.categories.join(',')})`)

  params.set('limit', '25')
  params.set('offset', String((filters.page - 1) * 25))
  params.set('sort', '-date')

  return params.toString()
}

const fetchDecisions = async (filters: Filters): Promise<NocoDBListResponse<Decision>> => {
  const qs = buildQueryString(filters)
  const response = await fetch(`/api/nocodb/decisions?${qs}`)
  if (!response.ok) throw new Error('Failed to fetch decisions')
  return response.json()
}

export const useDecisions = (filters: Filters) => {
  return useQuery({
    queryKey: DECISIONS_QUERY_KEY(filters),
    queryFn: () => fetchDecisions(filters),
    staleTime: 5 * 60 * 1000,
  })
}
```

> **Note d'intégration :** NocoDB supporte des filtres `where` complexes avec opérateurs. Adapter `buildQueryString` selon la structure exacte des tables NocoDB lors de l'intégration (noms de colonnes, IDs de table).

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useDecisions.ts
git commit -m "feat: add useDecisions hook with filter support"
```

---

## Task 12: useDecision hook

**Files:**
- Create: `src/hooks/useDecision.ts`

- [ ] **Step 1: Créer `src/hooks/useDecision.ts`**

```ts
import type { Decision } from '@/types/decision'
import { useQuery } from '@tanstack/react-query'

export const DECISION_QUERY_KEY = (id: string | null) => ['decision', id] as const

const fetchDecision = async (id: string): Promise<Decision> => {
  const response = await fetch(`/api/nocodb/decisions/${id}`)
  if (!response.ok) throw new Error(`Failed to fetch decision ${id}`)
  return response.json()
}

export const useDecision = (id: string | null) => {
  return useQuery({
    queryKey: DECISION_QUERY_KEY(id),
    queryFn: () => fetchDecision(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useDecision.ts
git commit -m "feat: add useDecision hook for single decision detail"
```

---

## Task 13: DecisionCard component

**Files:**
- Create: `src/components/DecisionCard.tsx`

- [ ] **Step 1: Créer `src/components/DecisionCard.tsx`**

```tsx
'use client'

import { Badge } from '@/components/ui/badge'
import type { Decision } from '@/types/decision'
import { cn } from '@/lib/utils'

interface DecisionCardProps {
  decision: Decision
  isActive: boolean
  onClick: () => void
}

const DecisionCard = ({ decision, isActive, onClick }: DecisionCardProps) => {
  const formattedDate = new Date(decision.date).toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 border rounded-lg transition-colors hover:bg-accent',
        isActive && 'bg-accent border-primary'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-sm font-medium leading-snug line-clamp-2">{decision.title}</h3>
        <span className="text-xs text-muted-foreground shrink-0">{decision.canton}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{formattedDate}</p>
      <div className="flex flex-wrap gap-1">
        {decision.keywords.slice(0, 3).map((kw) => (
          <Badge key={kw.id} variant="secondary" className="text-xs">
            {kw.label}
          </Badge>
        ))}
        {decision.keywords.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{decision.keywords.length - 3}
          </Badge>
        )}
      </div>
    </button>
  )
}

export default DecisionCard
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DecisionCard.tsx
git commit -m "feat: add DecisionCard component"
```

---

## Task 14: DecisionPanel component

**Files:**
- Create: `src/components/DecisionPanel.tsx`

- [ ] **Step 1: Créer `src/components/DecisionPanel.tsx`**

```tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useDecision } from '@/hooks/useDecision'
import { getCantonLabel } from '@/lib/cantons'
import { Copy, Download, X } from 'lucide-react'

interface DecisionPanelProps {
  decisionId: string | null
  onClose: () => void
}

const DecisionPanel = ({ decisionId, onClose }: DecisionPanelProps) => {
  const { data: decision, isLoading } = useDecision(decisionId)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
  }

  const groupedKeywords = decision?.keywords.reduce<Record<string, string[]>>(
    (acc, kw) => {
      if (!acc[kw.category]) acc[kw.category] = []
      acc[kw.category].push(kw.label)
      return acc
    },
    {}
  )

  const formattedDate = decision
    ? new Date(decision.date).toLocaleDateString('fr-CH', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <Sheet open={!!decisionId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="flex flex-row items-start justify-between gap-2">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleCopyLink} title="Copier le lien">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {isLoading && (
          <div className="space-y-4 mt-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {decision && (
          <div className="mt-4 space-y-4">
            <SheetTitle className="text-base leading-snug">{decision.title}</SheetTitle>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{getCantonLabel(decision.canton)}</span>
              <span>·</span>
              <span>{formattedDate}</span>
            </div>

            <Separator />

            <div>
              <p className="text-sm leading-relaxed">{decision.abstract}</p>
            </div>

            {groupedKeywords && Object.keys(groupedKeywords).length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  {Object.entries(groupedKeywords).map(([category, labels]) => (
                    <div key={category}>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{category}</p>
                      <div className="flex flex-wrap gap-1">
                        {labels.map((label) => (
                          <Badge key={label} variant="secondary" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <Separator />

            <Button asChild className="w-full" variant="outline">
              <a href={decision.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Télécharger le PDF
              </a>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default DecisionPanel
```

- [ ] **Step 2: Installer lucide-react si absent**

```bash
npm list lucide-react || npm install lucide-react
```

- [ ] **Step 3: Commit**

```bash
git add src/components/DecisionPanel.tsx
git commit -m "feat: add DecisionPanel component (Sheet) with keywords grouped by category"
```

---

## Task 15: FilterSidebar component

**Files:**
- Create: `src/components/FilterSidebar.tsx`

- [ ] **Step 1: Créer `src/components/FilterSidebar.tsx`**

```tsx
'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useFilters } from '@/hooks/useFilters'
import { useKeywords } from '@/hooks/useKeywords'
import { CANTONS } from '@/lib/cantons'
import { useCallback, useDeferredValue, useState } from 'react'

const FilterSidebar = () => {
  const { filters, setFilter, resetFilters } = useFilters()
  const { data: keywords = [] } = useKeywords()
  const [qInput, setQInput] = useState(filters.q)
  const deferredQ = useDeferredValue(qInput)

  const allCategories = [...new Set(keywords.map((kw) => kw.category))].sort()

  const keywordsInActiveCategories =
    filters.categories.length > 0
      ? keywords.filter((kw) => filters.categories.includes(kw.category))
      : []

  const toggleCategory = useCallback(
    (category: string) => {
      const next = filters.categories.includes(category)
        ? filters.categories.filter((c) => c !== category)
        : [...filters.categories, category]
      setFilter('categories', next)
    },
    [filters.categories, setFilter]
  )

  const toggleKeyword = useCallback(
    (kwId: string) => {
      const next = filters.keywords.includes(kwId)
        ? filters.keywords.filter((k) => k !== kwId)
        : [...filters.keywords, kwId]
      setFilter('keywords', next)
    },
    [filters.keywords, setFilter]
  )

  const handleQKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') setFilter('q', qInput)
  }

  const hasActiveFilters =
    filters.q ||
    filters.canton ||
    filters.categories.length > 0 ||
    filters.keywords.length > 0 ||
    filters.from ||
    filters.to

  return (
    <aside className="w-72 shrink-0 space-y-5 overflow-y-auto pr-4">
      {/* Recherche texte */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Recherche</label>
        <Input
          placeholder="Rechercher…"
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          onKeyDown={handleQKeyDown}
          onBlur={() => setFilter('q', qInput)}
        />
      </div>

      <Separator />

      {/* Canton */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Canton</label>
        <Select
          value={filters.canton || '_all'}
          onValueChange={(v) => setFilter('canton', v === '_all' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tous les cantons" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Tous les cantons</SelectItem>
            {CANTONS.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Catégories */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-2">Catégories</label>
        <div className="space-y-2">
          {allCategories.map((category) => (
            <div key={category} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${category}`}
                checked={filters.categories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <label htmlFor={`cat-${category}`} className="text-sm cursor-pointer leading-tight">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Mots-clés (visible uniquement si catégories sélectionnées) */}
      {keywordsInActiveCategories.length > 0 && (
        <>
          <Separator />
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">
              Mots-clés
            </label>
            <div className="space-y-2">
              {keywordsInActiveCategories.map((kw) => (
                <div key={kw.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`kw-${kw.id}`}
                    checked={filters.keywords.includes(kw.id)}
                    onCheckedChange={() => toggleKeyword(kw.id)}
                  />
                  <label htmlFor={`kw-${kw.id}`} className="text-sm cursor-pointer">
                    {kw.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Dates */}
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-2">Période</label>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-muted-foreground">De</label>
            <Input
              type="date"
              value={filters.from}
              onChange={(e) => setFilter('from', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">À</label>
            <Input
              type="date"
              value={filters.to}
              onChange={(e) => setFilter('to', e.target.value)}
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <>
          <Separator />
          <Button variant="ghost" size="sm" onClick={resetFilters} className="w-full">
            Réinitialiser les filtres
          </Button>
        </>
      )}
    </aside>
  )
}

export default FilterSidebar
```

- [ ] **Step 2: Commit**

```bash
git add src/components/FilterSidebar.tsx
git commit -m "feat: add FilterSidebar with text search, canton, categories, keywords, and date range"
```

---

## Task 16: DecisionList component

**Files:**
- Create: `src/components/DecisionList.tsx`

- [ ] **Step 1: Créer `src/components/DecisionList.tsx`**

```tsx
'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import DecisionCard from '@/components/DecisionCard'
import { useDecisions } from '@/hooks/useDecisions'
import { useFilters } from '@/hooks/useFilters'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

const DecisionList = () => {
  const { filters, setFilter } = useFilters()
  const { data, isLoading, isError } = useDecisions(filters)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeDecisionId = searchParams.get('decision')

  const openDecision = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('decision', id)
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Une erreur est survenue lors du chargement des décisions.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  const decisions = data?.list ?? []
  const pageInfo = data?.pageInfo

  if (decisions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Aucune décision ne correspond à vos critères.
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="space-y-2">
        {decisions.map((decision) => (
          <DecisionCard
            key={decision.id}
            decision={decision}
            isActive={decision.id === activeDecisionId}
            onClick={() => openDecision(decision.id)}
          />
        ))}
      </div>

      {pageInfo && (
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
          <span>
            {pageInfo.totalRows} décision{pageInfo.totalRows !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pageInfo.isFirstPage}
              onClick={() => setFilter('page', filters.page - 1)}
            >
              Précédent
            </Button>
            <span>
              Page {pageInfo.page} / {Math.ceil(pageInfo.totalRows / pageInfo.pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pageInfo.isLastPage}
              onClick={() => setFilter('page', filters.page + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DecisionList
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DecisionList.tsx
git commit -m "feat: add DecisionList with pagination and empty/loading states"
```

---

## Task 17: Page principale et câblage final

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Modifier `src/app/page.tsx`**

```tsx
'use client'

import DecisionList from '@/components/DecisionList'
import DecisionPanel from '@/components/DecisionPanel'
import FilterSidebar from '@/components/FilterSidebar'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export default function Home() {
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
      {/* Sidebar filtres */}
      <div className="w-72 shrink-0 border-r p-4 overflow-y-auto">
        <h1 className="text-sm font-semibold mb-4 text-foreground">
          Décisions · Protection des données
        </h1>
        <FilterSidebar />
      </div>

      {/* Liste centrale */}
      <main className="flex-1 p-4 overflow-y-auto">
        <DecisionList />
      </main>

      {/* Panneau détail */}
      <DecisionPanel decisionId={decisionId} onClose={closePanel} />
    </div>
  )
}
```

- [ ] **Step 2: Vérifier que le build passe**

```bash
npm run build
```

Attendu : build réussi sans erreurs TypeScript ni warnings critiques.

- [ ] **Step 3: Lancer tous les tests**

```bash
npm test
```

Attendu : tous les tests passent.

- [ ] **Step 4: Démarrer le serveur et vérifier manuellement**

```bash
npm run dev
```

Vérifier dans le navigateur :
- `http://localhost:3000` affiche la sidebar + liste (vide ou erreur NocoDB attendue sans config)
- `http://localhost:3000?decision=1` tente d'ouvrir le panneau
- Les filtres modifient l'URL
- Le bouton "Réinitialiser" vide l'URL

- [ ] **Step 5: Commit final**

```bash
git add src/app/page.tsx
git commit -m "feat: wire up main page with FilterSidebar, DecisionList, and DecisionPanel"
```

---

## Note d'intégration NocoDB

Lors du branchement sur la vraie instance NocoDB, adapter :

1. **`src/hooks/useDecisions.ts`** — remplacer les chemins d'API et les noms de colonnes NocoDB (table ID, noms exacts des champs)
2. **`src/hooks/useKeywords.ts`** — pointer vers la vraie table des mots-clés
3. **`src/hooks/useDecision.ts`** — vérifier le format de l'ID et la structure de retour
4. **`.env.local`** — renseigner `NEXT_PUBLIC_NOCODB_API_URL` et `NOCODB_API_TOKEN` avec les vraies valeurs
