# Memory Vault Docs

This folder contains the working documentation for the `memory-vault` project.

## Suggested reading order

1. `README.md`
   Project overview, runtime, and doc map.
2. `architecture.md`
   Backend and frontend boundaries, module split, and request flow.
3. `api.md`
   Implemented HTTP endpoints and supported query parameters.
4. `features.md`
   Delivered user-facing features and current behavior.
5. `search-filter.md`
   Independent search and filter layer introduced on 2026-05-13.
6. `database.md`
   Database schema and migration notes.
7. `changelog.md`
   Time-ordered change record.

## Project summary

Memory Vault is a private photo and video sharing application with:

- JWT login and registration
- Shared album browsing across users
- Album-based media upload and playback
- Nested comments
- Profile editing
- Admin moderation for users, albums, and media
- Independent search and filter flows for public and admin lists

## Runtime

- Frontend: React 18 + Vite
- Backend: Express 4
- Database: MySQL 8
- Upload handling: Multer
- Basic API protection: `express-rate-limit`

Default local addresses:

- Frontend dev server: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Health endpoint: `http://localhost:3000/api/health`

## Local startup

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite proxies `/api` and `/uploads` to `http://localhost:3000` in development.

## Database assumptions

The backend currently reads MySQL config from `backend/src/config/db.js`:

- host: `localhost`
- port: `3306`
- user: `root`
- password: empty string
- database: `memory_vault`

Make sure local MySQL matches that configuration, or update the file before starting the backend.

## Security configuration notes

- Set `JWT_SECRET` in production. The backend now throws on startup if production uses the default development secret.
- Optional: set `JWT_EXPIRES_IN` to override the default `7d` token lifetime.

## Search and filter notes

Search and filter was intentionally added as an isolated layer instead of being mixed into CRUD logic.

- Frontend state is managed by `useUrlFilterState`
- Read concerns live in `*Query` hooks
- Write concerns live in `*Mutations` hooks
- Backend search logic lives in dedicated query services

See `search-filter.md` for the full breakdown.

## Documentation maintenance rules

When the implementation changes, keep these files aligned:

- API changes: update `api.md`
- Architecture or module boundary changes: update `architecture.md`
- User-visible behavior changes: update `features.md`
- Search/filter behavior changes: update `search-filter.md`
- Any release-sized change: update `changelog.md`
