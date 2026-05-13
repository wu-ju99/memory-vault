# Changelog

## 2026-05-13

### Media download

- Added a standalone single-media download flow for album detail pages
- Added protected backend download endpoint `GET /api/media/:id/download`
- Added isolated frontend download handling without mixing it into upload or delete mutations
- Added download actions to album detail media cards and preview modal

### Media upload fix

- Fixed a video upload regression where valid `.mp4`, `.mov`, and `.webm` files could be skipped and reported as zero uploaded files
- Hardened media type detection so upload handling now falls back to file extension when browser metadata is incomplete
- Fixed backend upload limit exports so image and video size validation uses the intended limits again
- Added clearer frontend and backend error handling when all selected files fail format or size validation
- Kept album detail media display partitioned by uploader, then split into photo and video sections

### Dialog UI

- Replaced browser-native confirm and prompt dialogs with standalone in-app modal dialogs
- Added isolated dialog components in `frontend/src/components/dialogs/`
- Added isolated dialog styling in `frontend/src/styles/dialog.css`
- Covered album rename, album delete, memory delete, admin user delete, admin album delete, and admin media delete flows
- Kept dialog presentation separate from page business logic to avoid overlapping responsibilities

### UI copy and navigation

- Localized search, filter, admin, and browsing actions to Chinese across home, album detail, and admin pages
- Added shared frontend label helpers in `frontend/src/utils/uiLabels.js` for role, media-type, and unknown-year display
- Simplified profile-page navigation so it keeps only a top-right return-home action

### Profile UI

- Added a standalone profile settings visual layer in `frontend/src/styles/profile.css`
- Reworked the profile page into a dedicated account-center layout for avatar, nickname, and password editing
- Unified avatar, nickname, and password form presentation without changing profile update APIs
- Removed older mixed profile styling from the global stylesheet

### Authentication UI

- Added a dedicated shared auth shell for login and register pages
- Moved auth-page styling into a standalone `frontend/src/styles/auth.css`
- Refreshed login/register visuals with cleaner layout, shorter copy, and mobile-friendly spacing
- Removed old mixed auth card styling from the global stylesheet

### Search and filter

- Added independent search and filter support for home albums
- Added independent search and filter support for album detail media
- Added independent search and filter support for admin users
- Added independent search and filter support for admin albums
- Added independent search and filter support for admin media

### Frontend structure

- Added `useUrlFilterState` for URL-backed filter state
- Split read flows into dedicated `*Query` hooks
- Split write flows into dedicated `*Mutations` hooks
- Added reusable filter UI components for search and select controls
- Kept older mixed hook entry points as compatibility wrappers

### Backend structure

- Added `albumQueryService`
- Added `mediaQueryService`
- Added `adminUserQueryService`
- Added `adminAlbumQueryService`
- Added `adminMediaQueryService`
- Added shared query helper `utils/queryFilters.js`
- Kept write logic in existing management services to avoid overlapping responsibilities
- Fixed MySQL `LIKE ... ESCAPE` SQL generation in the query services
- Declared `bcryptjs` and `jsonwebtoken` in `backend/package.json` and refreshed the backend lockfile

### API

- Added `GET /api/albums/:id` for direct album detail loading
- Extended list endpoints to support isolated search/filter query parameters

### Documentation

- Added `docs/search-filter.md`
- Reworked main docs to reflect the current modular architecture

### Verification

- Frontend production build succeeded locally
- Backend source passed `node --check`

## 2026-05-07

### UI and componentization

- Extracted reusable presentation components from large page files
- Reduced page-level state overlap in album detail and profile flows
- Added dedicated profile editing surfaces

### Product features

- Added avatar upload
- Added nickname editing
- Added password change flow
- Added nested comment replies
- Added event time support for media
- Added shared browsing behavior across users
- Added admin dashboard capabilities

## 2026-05-06

### Initial foundation

- Created Express + React + Vite project structure
- Added MySQL-backed authentication
- Added album and media flows
- Added upload handling
- Added comment system
- Added documentation folder
