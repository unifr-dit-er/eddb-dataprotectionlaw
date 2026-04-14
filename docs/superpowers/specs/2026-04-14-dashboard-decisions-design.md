# Design : Dashboard Décisions de Protection des Données

**Date :** 2026-04-14
**Projet :** eddb-dataprotectionlaw
**Stack :** Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · TanStack Query · NocoDB

---

## 1. Contexte

Application web read-only affichant des décisions juridiques suisses relatives à la protection des données. Les données sont stockées dans NocoDB et exposées via son API. Il n'y a pas d'authentification ni de base de données propre.

---

## 2. Modèle de données

```ts
// src/types/decision.ts
interface Decision {
  id: string
  title: string
  abstract: string
  canton: string       // code ou nom du canton (ex: "GE", "ZH")
  date: string         // ISO 8601 (ex: "2024-03-15")
  keywords: Keyword[]
  pdfUrl: string
}

// src/types/keyword.ts
interface Keyword {
  id: string
  label: string
  category: string
}
```

Les 26 cantons suisses sont une liste fixe définie dans `src/lib/cantons.ts`.

Les catégories de mots-clés proviennent de NocoDB via `useKeywords()` — elles ne sont pas codées en dur car elles peuvent évoluer.

---

## 3. Architecture

### 3.1 Flux de données

```
Client (Browser)
  └─ TanStack Query hooks
       └─ /api/nocodb/[...path]  (Next.js Route Handler)
            └─ NocoDB API  (token injecté côté serveur)
```

Le token NocoDB (`NOCODB_API_TOKEN`) n'est jamais exposé au client. Tous les appels passent par le proxy.

### 3.2 Variables d'environnement

```
NEXT_PUBLIC_NOCODB_API_URL=   # URL de base NocoDB (accessible côté client pour construire les chemins)
NOCODB_API_TOKEN=              # Token NocoDB (serveur uniquement)
```

---

## 4. Structure des fichiers

```
src/
├── app/
│   ├── api/
│   │   └── nocodb/
│   │       └── [...path]/
│   │           └── route.ts        # Proxy générique GET vers NocoDB
│   ├── layout.tsx                  # QueryClientProvider ici
│   └── page.tsx                    # Page principale (thin wrapper)
├── components/
│   ├── ui/                         # shadcn/ui (ne pas éditer manuellement)
│   ├── FilterSidebar.tsx
│   ├── DecisionList.tsx
│   ├── DecisionCard.tsx
│   └── DecisionPanel.tsx
├── hooks/
│   ├── useDecisions.ts
│   ├── useDecision.ts
│   ├── useKeywords.ts
│   └── useFilters.ts
├── lib/
│   ├── nocodb.ts                   # Client NocoDB (route handlers uniquement)
│   ├── cantons.ts                  # Liste fixe des 26 cantons
│   └── utils.ts                    # cn() et autres utilitaires
└── types/
    ├── decision.ts
    └── keyword.ts
```

---

## 5. Mise en page

### 5.1 Layout à 3 zones

```
┌─────────────────────────────────────────────────────────────────┐
│  [FilterSidebar ~280px]  │  [DecisionList flex-1]  │  [Panel]   │
│                          │                          │  (Sheet)   │
│  Recherche texte         │  DecisionCard            │            │
│  Canton (select)         │  DecisionCard            │  Titre     │
│  Catégories (checkboxes) │  DecisionCard            │  Canton    │
│  Mots-clés (checkboxes)  │  ...                     │  Date      │
│  Dates (de / à)          │  [Pagination]            │  Abstract  │
│  [Réinitialiser]         │                          │  Mots-clés │
│                          │                          │  PDF       │
└─────────────────────────────────────────────────────────────────┘
```

Le panneau droit utilise le composant shadcn `Sheet` (slide-in depuis la droite). Il est visible uniquement quand `?decision=id` est présent dans l'URL.

### 5.2 Responsive

Sur mobile, la sidebar se replie derrière un bouton "Filtres". Le panneau de détail prend toute la largeur.

---

## 6. Gestion de l'état via URL

Tous les filtres et l'ID de la décision ouverte vivent dans les search params :

| Param       | Valeur exemple         | Description                        |
|-------------|------------------------|------------------------------------|
| `q`         | `données médicales`    | Recherche texte libre              |
| `canton`    | `GE`                   | Canton sélectionné                 |
| `category`  | `Santé`                | Catégorie(s) — répétable           |
| `keyword`   | `42`                   | ID(s) de mot-clé — répétable       |
| `from`      | `2022-01-01`           | Date de début                      |
| `to`        | `2024-12-31`           | Date de fin                        |
| `decision`  | `123`                  | ID décision ouverte dans le panneau|
| `page`      | `2`                    | Page courante                      |

**Ouvrir le panneau :** `router.push(?decision=id)` (conserve les autres params).
**Fermer le panneau :** supprimer le param `decision` de l'URL.
**Lien partageable :** l'URL courante encode l'état complet.

---

## 7. Composants

### `FilterSidebar`
- Champ texte → met à jour `q`
- Select canton → met à jour `canton`
- Checkboxes catégories (issues de `useKeywords()`) → met à jour `category[]`
- Checkboxes mots-clés filtrés selon catégories actives → met à jour `keyword[]`
- Inputs date de/à → mettent à jour `from` / `to`
- Bouton "Réinitialiser" → supprime tous les params filtres

### `DecisionList`
- Consomme `useDecisions(filters)` 
- Affiche une liste de `<DecisionCard />`
- Pagination simple (prev / next / numéros de page)
- État vide : message "Aucune décision ne correspond à vos critères"
- État chargement : skeletons

### `DecisionCard`
- Affiche : titre, canton, date, 2-3 premiers mots-clés en badges
- Click → `router.push(?...params&decision=id)`

### `DecisionPanel`
- Composant shadcn `Sheet` (position right)
- Affiche : titre, canton, date, abstract complet, tous les mots-clés groupés par catégorie
- Bouton "Télécharger le PDF" → ouvre `pdfUrl` dans un nouvel onglet
- Bouton "Copier le lien" → copie l'URL courante dans le presse-papier
- Fermeture → supprime `decision` des search params

---

## 8. Hooks

### `useFilters()`
Lit et écrit les search params de l'URL via `useSearchParams()` et `useRouter()`.

```ts
const { filters, setFilter, resetFilters } = useFilters()
```

Pas d'appel réseau. Expose un objet `filters` typé avec toutes les valeurs courantes.

### `useDecisions(filters)`
```ts
queryKey: ['decisions', filters]
staleTime: 5 * 60 * 1000  // 5 minutes
```
Appelle `/api/nocodb/decisions` avec les filtres sérialisés. Retourne `{ decisions, pagination, isLoading, isError }`.

### `useDecision(id)`
```ts
queryKey: ['decision', id]
enabled: !!id
staleTime: 10 * 60 * 1000  // 10 minutes
```
Appelle `/api/nocodb/decisions/:id`. Activé uniquement si `id` est défini.

### `useKeywords()`
```ts
queryKey: ['keywords']
staleTime: 30 * 60 * 1000  // 30 minutes
```
Charge la liste complète des mots-clés avec leurs catégories. Données quasi-statiques.

---

## 9. Proxy NocoDB

**`src/app/api/nocodb/[...path]/route.ts`**

Handler `GET` générique :
1. Reconstruit le chemin NocoDB à partir du slug `[...path]`
2. Transfère tous les query params
3. Injecte le header `xc-auth: NOCODB_API_TOKEN`
4. Retourne la réponse JSON telle quelle

**`src/lib/nocodb.ts`**

```ts
fetchNocoDB(path: string, params?: Record<string, string>): Promise<unknown>
```

Utilisé exclusivement dans les route handlers. Jamais importé dans des composants ou hooks.

---

## 10. Ce que l'on ne construit pas

- Pas d'authentification
- Pas d'écriture / mutation de données
- Pas de page dédiée par décision (le panneau latéral + URL param suffit)
- Pas de gestion d'état global (Zustand, etc.) — TanStack Query + URL params suffisent
