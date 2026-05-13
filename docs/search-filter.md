# Search And Filter

## Scope

This document describes the independent search and filter layer added on 2026-05-13.

Implemented areas:

- Home album list
- Album detail media list
- Admin users
- Admin albums
- Admin media

## Frontend structure

The feature is intentionally split by responsibility:

- `useUrlFilterState`
  - owns URL query param state
  - refresh-safe
  - sharable page state

- `*Query` hooks
  - own list loading only
  - no create / update / delete side effects

- `*Mutations` hooks
  - own write actions only
  - call query reload functions after changes

- page components
  - compose query hooks, mutation hooks, search UI, and display components
  - do not embed list-fetching logic into presentational components

## Backend structure

List endpoints now route search/filter logic through dedicated query services:

- `albumQueryService`
- `mediaQueryService`
- `adminUserQueryService`
- `adminAlbumQueryService`
- `adminMediaQueryService`

Shared filter helpers live in:

- `backend/src/utils/queryFilters.js`

Write operations remain in their original management services, so search/filter logic stays isolated from permission checks and CRUD side effects.

## Supported filters

### Home albums

- keyword: album title / owner username / owner nickname
- year
- owner

### Album detail media

- keyword: media description
- type: image / video
- year: `event_time` year, fallback to `created_at`
- owner

### Admin users

- keyword: username / nickname
- role

### Admin albums

- keyword: album title / owner username / owner nickname
- year
- owner

### Admin media

- keyword: description / album title / uploader username / uploader nickname
- type
- year
- owner
- album

## Notes

- No database schema change was required.
- Existing create / update / delete contracts were kept intact.
- Legacy mixed hooks were converted into compatibility wrappers over the new query/mutation split.
- Frontend build completed successfully in the local environment.
- Backend source passed `node --check`.
- Live backend smoke checks passed after the local MySQL instance was started.
