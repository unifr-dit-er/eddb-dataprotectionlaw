# Project Overview

This is a read-only dashboard/SaaS web app that displays data fetched from a NocoDB API.
There is no authentication and no database — all data comes from NocoDB.

# Tech Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **TanStack Query** for all data fetching and caching

# Environment Variables

```
NEXT_PUBLIC_NOCODB_API_URL=   # NocoDB base URL
NOCODB_API_TOKEN=              # NocoDB API token (server-side only)
```

# Architecture

- All NocoDB requests are proxied through `/app/api/nocodb/` to keep the API token server-side
- All data fetching on the client uses **TanStack Query** (`useQuery`, `useMutation`)
- No direct `fetch` calls in components or pages — always go through a custom hook
- No Server Components for data fetching — use Client Components with TanStack Query

# Folder Structure

```
src/
├── app/
│   ├── api/
│   │   └── nocodb/        # Proxy route handlers to NocoDB
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                # shadcn/ui generated components (do not edit manually)
│   └── ...                # App-specific components
├── hooks/                 # Custom hooks, all prefixed with "use"
├── lib/
│   └── nocodb.ts          # NocoDB API client (used in route handlers only)
└── types/                 # Shared TypeScript types and interfaces
```

# Conventions

- All custom hooks go in `src/hooks/` and are prefixed with `use` (e.g. `useProjects.ts`)
- Types and interfaces go in `src/types/` — no inline type definitions for shared data shapes
- Components are PascalCase, files match component name (e.g. `ProjectCard.tsx`)
- No `any` in TypeScript — use `unknown` and narrow properly if needed
- Use `cn()` from `lib/utils` for conditional Tailwind class merging

# What We Do NOT Use

- No authentication (NextAuth, Clerk, etc.)
- No database or ORM (Prisma, Drizzle, etc.)
- No global state manager (Zustand, Jotai, Redux, etc.) — TanStack Query handles server state
- No Server Components for data fetching
- No direct `fetch` calls outside of `/app/api/` route handlers
- No `use client` in page-level components — keep pages as thin wrappers

# shadcn/ui

- Use the CLI to add components: `npx shadcn@latest add <component>`
- Do not manually edit files in `src/components/ui/` — re-run the CLI instead
- Prefer shadcn primitives over custom implementations for common UI patterns

# TanStack Query

- Wrap the app with `QueryClientProvider` in `src/app/layout.tsx`
- Define query keys as constants in `src/hooks/` alongside the hook that uses them
- Use `staleTime` appropriately — NocoDB data does not need to refetch on every focus

# Code Style

- Prefer arrow functions for components and hooks
- Use named exports for components, default export only for Next.js pages/layouts
- Keep components small and focused — extract logic into hooks, not inline in JSX
