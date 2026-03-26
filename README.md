This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Backend API (challenge réservation)

### Swagger (livrable)

- Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/openapi.json`

### Base de données (SQLite + Prisma)

- DB dev: `dev.db`
- Schema Prisma: `prisma/schema.prisma`

Commandes utiles:

```bash
npx prisma migrate dev
npx prisma studio
```

### Auth (JWT)

Variables d'environnement:

- `JWT_SECRET` (obligatoire)
- `DATABASE_URL` (SQLite par défaut)

Endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`

### Création du premier admin (bootstrap)

Le premier ADMIN peut être créé via `POST /api/auth/register` si:

- `ADMIN_BOOTSTRAP_TOKEN` est défini dans `.env`
- le header `x-bootstrap-token` correspond
- aucun utilisateur ADMIN n’existe encore

Ensuite, les endpoints admin (CRUD restaurants/tables) exigent un JWT avec `role=ADMIN`.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
