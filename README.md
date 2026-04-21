# EDDB — Droit de la protection des données

Dashboard de jurisprudence en droit de la protection des données, alimenté par NocoDB.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query

## Développement

### Prérequis

- Node.js 22+
- Accès à l'instance NocoDB

### Installation

```bash
git clone <url-du-repo>
cd eddb-dataprotectionlaw
npm install
```

### Variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
NOCODB_API_TOKEN=your_token_here
```

> `NEXT_PUBLIC_NOCODB_API_URL` est déjà défini dans `.env` et versionné dans le repo.

### Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

## Production

Le déploiement se fait via Podman + Quadlet sur la VM.

- [Procédure de déploiement initial](docs/podman-deploy.md)
- [Procédure de mise à jour](docs/podman-update.md)
