# Architecture

## System overview

Memory Vault is a two-tier web app:

- Frontend: React SPA served by Vite at `http://localhost:5173`
- Backend: Express API at `http://localhost:3000`
- Database: MySQL `memory_vault`
- Static uploads: served from `backend/uploads` at `/uploads/*`

In development, Vite proxies:

- `/api` -> `http://localhost:3000`
- `/uploads` -> `http://localhost:3000`

## Frontend structure

Key frontend directories:

- `src/pages`
  Route-level pages
- `src/components`
  Reusable presentation and interaction units
- `src/hooks`
  Data loading, mutations, local state, and UI behavior
- `src/api`
  HTTP wrappers around backend endpoints
- `src/utils`
  Shared client-side utilities

### Routes

Defined in `frontend/src/App.jsx`:

- `/login`
- `/register`
- `/profile`
- `/admin`
- `/album/:id`
- `/`

### Frontend responsibility split

The current codebase intentionally separates read and write concerns.

Read hooks:

- `useAlbumListQuery`
- `useAlbumMediaQuery`
- `useAdminUsersQuery`
- `useAdminAlbumsQuery`
- `useAdminMediaQuery`

Write hooks:

- `useAlbumMutations`
- `useAlbumMediaMutations`
- `useAdminUserMutations`
- `useAdminAlbumMutations`
- `useAdminMediaMutations`

URL-backed filter state:

- `useUrlFilterState`

Compatibility wrappers kept for older imports:

- `useAlbums`
- `useAlbumMedia`
- `useAdminUsers`
- `useAdminAlbums`
- `useAdminMedia`

This keeps new search/filter logic independent from create, update, and delete flows.

### Presentation layer

List and page UIs compose small components instead of embedding everything in page files.

Examples:

- `auth/AuthShell`
- `FilterToolbar`, `FilterSelect`, `SearchBar`
- `AlbumCard`, `AlbumYearSection`, `AlbumUserSection`
- `MediaCard`, `MediaUploader`, `MediaModal`, `MediaYearSection`
- `AdminUserTable`, `AdminAlbumTable`, `AdminMediaGrid`

Authentication pages now use a dedicated presentation layer:

- `frontend/src/components/auth/AuthShell.jsx`
  Shared structure for login and register pages
- `frontend/src/styles/auth.css`
  Auth-only visual system, kept separate from the rest of the app

This keeps authentication UI changes isolated instead of mixing them into general page styles.

Profile settings now use a dedicated presentation layer as well:

- `frontend/src/styles/profile.css`
  Profile-only layout and visual system
- `frontend/src/pages/Profile.jsx`
  Owns account-summary and security layout composition
- `frontend/src/components/AvatarUploader.jsx`
  Avatar update UI within the profile surface
- `frontend/src/components/NicknameEditor.jsx`
  Nickname update UI within the profile surface

This keeps profile-page refinement independent from the rest of the product UI.

## Backend structure

Key backend directories:

- `src/routes`
  Route declarations and middleware composition
- `src/controllers`
  HTTP request/response handling
- `src/services`
  Business logic and data access orchestration
- `src/middlewares`
  Auth, upload, logging, and error handling
- `src/utils`
  Cross-service helpers
- `src/config`
  Database and JWT configuration

### Request flow

Normal request path:

1. Express route matches under `/api`
2. Route-level middleware runs
3. Controller validates and parses HTTP input
4. Service layer executes business logic
5. MySQL is queried through `mysql2/promise`
6. Controller returns JSON

### Middleware stack

Configured in `backend/src/app.js`:

- `express.json()`
- request logger
- static `/uploads`
- `/api` routes
- upload error handler
- application error handler

### Auth boundary

- `middlewares/auth.js` injects `req.user` from JWT
- `middlewares/adminOnly.js` enforces admin-only access

## Backend service split

### Album domain

- `albumService.js`
  Base album data access helpers
- `albumManagementService.js`
  Create, rename, delete, and ownership rules
- `albumCoverService.js`
  Cover upload and cover selection behavior
- `albumQueryService.js`
  Album read/search/filter logic

### Media domain

- `mediaService.js`
  Base media data access helpers
- `mediaUploadService.js`
  File classification, validation, and media creation
- `mediaManagementService.js`
  Description update, delete, and side effects
- `mediaQueryService.js`
  Media read/search/filter logic

### Admin domain

- `adminUserService.js`
  Admin write actions for users
- `adminAlbumService.js`
  Admin write actions for albums
- `adminMediaService.js`
  Admin write actions for media
- `adminUserQueryService.js`
  User list search/filter logic
- `adminAlbumQueryService.js`
  Album list search/filter logic
- `adminMediaQueryService.js`
  Media list search/filter logic

### Shared helpers

- `fileStorageService.js`
  Upload path and file delete helpers
- `queryFilters.js`
  Shared query normalization and validation
- `parseId.js`
  Common id parsing
- `httpError.js`
  Reusable HTTP-style errors

## Search and filter design

The search/filter implementation added on 2026-05-13 follows two rules:

1. Read concerns stay separate from write concerns.
2. Filter state stays local to the current page and serializes into the URL.

This means:

- no CRUD service was overloaded with filter-specific SQL
- no page-level write hook owns list-fetching logic
- no filter state is hidden in unrelated component internals

Supported search/filter surfaces:

- home album list
- album detail media list
- admin users
- admin albums
- admin media

See `search-filter.md` for concrete filters.

## Data model summary

Main tables:

- `users`
- `albums`
- `media`
- `comments`

Relationship summary:

- one user -> many albums
- one user -> many media items
- one user -> many comments
- one album -> many media items
- one media item -> many comments

Deletion behavior is handled partly by relational constraints and partly by service-layer cleanup.

## Runtime assumptions

Current database config is hardcoded in `backend/src/config/db.js`:

- host `localhost`
- port `3306`
- user `root`
- empty password
- database `memory_vault`

If local runtime differs, update that config before starting the backend.
