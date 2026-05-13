# Features

This file tracks implemented product behavior, not future ideas.

## Authentication

- User registration with password confirmation
- User login with JWT response
- Dedicated standalone login/register UI with a shared auth shell
- Protected routes on the frontend
- Automatic token attachment on API requests
- Automatic local logout on `401` responses

## Profile

- View current profile
- Update nickname
- Upload avatar
- Change password with old-password verification
- Dedicated standalone profile settings UI for avatar, nickname, and password flows
- Admin badge and avatar-ready user identity rendering

## Shared album browsing

- Logged-in users can browse shared albums from all users
- Album cards show owner identity
- Albums are grouped by year on the home page
- Within a year, albums can be segmented by owner
- Dedicated album detail page per album
- Album detail no longer depends on fetching the full album list first
- Core browsing actions, search, filter, and admin-entry labels are localized to Chinese for end users

## Album management

- Create album
- Rename owned album
- Delete owned album
- Upload album cover
- Reuse an existing album media item as cover
- Rename and delete flows use standalone in-app dialogs instead of browser-native prompts

## Media management

- Upload image and video files
- Batch upload support
- Media description editing
- Media deletion by uploader or admin
- Event time support, with created time fallback when event time is absent
- Full-screen modal preview with previous/next navigation
- Media deletion uses a dedicated in-app confirmation dialog

## Comments

- Create comments
- Reply to comments
- Nested tree rendering
- Delete own comments
- Admin can delete any comment

## Admin

- Dedicated `/admin` page
- User management
- Album management
- Media management
- Chinese labels for admin navigation, filters, and management actions
- Admin delete actions use a shared in-app confirmation dialog
- Admin-only route protection
- Last-admin and self-delete protection on admin user deletion flow

## Search and filter

Independent search and filter is implemented for:

- Home album list
- Album detail media list
- Admin users
- Admin albums
- Admin media

Supported filter categories:

- keyword
- year
- owner or uploader
- role
- media type
- album

Behavior notes:

- filter state is mirrored into URL query params
- refresh keeps the active filters
- page links can preserve sharable filter state
- reset only clears the current feature's filter keys

## Frontend maintainability split

The codebase now keeps these concerns separate:

- `*Query` hooks for reads
- `*Mutations` hooks for writes
- `useUrlFilterState` for filter serialization
- page components for composition only
- reusable filter UI components for consistent controls
- reusable dialog UI components for confirm/input overlays

This was done specifically to avoid overlapping feature ownership and future spaghetti code.

## Backend maintainability split

Search/filter SQL is isolated in dedicated query services:

- `albumQueryService`
- `mediaQueryService`
- `adminUserQueryService`
- `adminAlbumQueryService`
- `adminMediaQueryService`

CRUD and permission side effects remain in the original management services.

## No schema change for search/filter

The 2026-05-13 search/filter work did not require a database schema change.
