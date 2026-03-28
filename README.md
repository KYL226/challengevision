
Application web de **réservation de tables** dans des restaurants : API REST documentée (Swagger), interface client (recherche, disponibilités, réservations) et **dashboard administrateur** (CRUD restaurants / tables, liste des réservations, stats et historique).

## Démarrage rapide

```bash
npm install
# Créer un fichier .env à la racine (voir tableau des variables ci-dessous)
npx prisma migrate dev
npx prisma generate
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Variables d’environnement (`.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Chaîne SQLite, ex. `file:./dev.db` (recommandé : chemin cohérent avec la racine du projet) |
| `JWT_SECRET` | Secret pour signer les JWT (**obligatoire** en production) |
| `ADMIN_BOOTSTRAP_TOKEN` | (Optionnel) Token pour créer le **premier** compte ADMIN via l’inscription (voir plus bas) |

> Prisma CLI charge la config via `prisma.config.ts` (déjà présent). Next.js charge `.env` au runtime.

## Base de données (Prisma)

- Schéma : `prisma/schema.prisma`
- Migrations : `prisma/migrations/`
- Client généré : `app/generated/prisma/` (ne pas éditer à la main)

Commandes utiles :

```bash
npx prisma migrate dev
npx prisma studio
npx prisma generate
```

## API REST (aperçu)

Toutes les routes sont sous **`/api/...`**. Authentification : header `Authorization: Bearer <token>`.

| Domaine | Méthodes | Notes |
|---------|----------|--------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` | JWT renvoyé dans le corps |
| Restaurants | `GET/POST /api/restaurants`, `GET/PUT/DELETE /api/restaurants/:id` | `POST/PUT/DELETE` : **ADMIN** |
| Tables | `GET /api/restaurants/:id/tables`, `POST /api/tables`, `PUT/DELETE /api/tables/:id` | Création / édition / suppression : **ADMIN** |
| Disponibilité | `GET /api/availability` | Par `tableId` ou `restaurantId` + `capacity` + plage horaire |
| Réservations | `GET/POST /api/reservations`, `GET/PUT/DELETE /api/reservations/:id` | Client : ses réservations ; admin : toutes |
| Historique | `GET /api/reservations/:id/history` | Événements liés à une réservation |

### Swagger (livrable)

- **Swagger UI** : [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **OpenAPI JSON** : [http://localhost:3000/api/openapi.json](http://localhost:3000/api/openapi.json)

## Premier compte administrateur (bootstrap)

Si aucun utilisateur **ADMIN** n’existe encore, vous pouvez en créer un via `POST /api/auth/register` en ajoutant :

- dans `.env` : `ADMIN_BOOTSTRAP_TOKEN=<secret>`
- dans la requête : header `x-bootstrap-token: <secret>`

Le compte créé aura le rôle **ADMIN** (uniquement tant qu’il n’y a pas encore d’admin en base).

## Frontend (pages principales)

| Route | Rôle |
|-------|------|
| `/` | Accueil |
| `/restaurants` | Liste + filtres (capacité, date, heure) |
| `/restaurants/[id]` | Détail + tables disponibles + réservation |
| `/login`, `/register` | Connexion / inscription |
| `/my-reservations` | Mes réservations |
| `/dashboard` | **Admin** : sidebar (restaurants, tables, réservations, stats / historique), thème clair-sombre, toasts |

La navbar inclut un **toggle thème** (clair / sombre) et la déconnexion.

## Scripts npm

```bash
npm run dev      # serveur de développement
npm run build    # build production
npm run start    # démarrage après build
npm run lint     # ESLint
```
