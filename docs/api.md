# API Reference

Base URL in local development:

- `http://localhost:3000/api`

Authentication:

- Protected routes require `Authorization: Bearer <token>`
- Admin routes additionally require `user.role === 'admin'`

## Health

### `GET /health`

Returns a simple backend health response.

## Auth

### `POST /auth/register`

Create a new user.

Request body:

```json
{
  "username": "alice",
  "password": "secret123",
  "confirm_password": "secret123"
}
```

Notes:

- `username` is required
- password minimum length is `6`
- `confirm_password` must match `password`

### `POST /auth/login`

Log in and receive a JWT.

Request body:

```json
{
  "username": "alice",
  "password": "secret123"
}
```

Response shape:

```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "username": "alice",
    "nickname": "Alice",
    "avatar": "/uploads/avatars/...",
    "role": "user"
  }
}
```

### `PUT /auth/me`

Update the current user's username and optional password.

Request body:

```json
{
  "username": "alice",
  "password": "newsecret123",
  "confirm_password": "newsecret123"
}
```

Notes:

- `username` is required
- if `password` is sent, `confirm_password` must also match

## User

### `GET /user/profile`

Return the current user profile.

### `PUT /user/update-profile`

Update nickname, avatar, and optional password.

Content type:

- `multipart/form-data`

Fields:

- `nickname`
- `oldPassword`
- `newPassword`
- `confirmPassword`
- `avatar` file

Avatar rules:

- image only
- supported extensions: `jpg`, `jpeg`, `png`, `webp`
- max size: `2MB`

## Albums

### `POST /albums`

Create an album.

Request body:

```json
{
  "title": "Trip to Hangzhou",
  "album_year": 2025
}
```

### `GET /albums`

List albums.

Supported query params:

- `q`: search by album title, owner username, or owner nickname
- `year`: album year, with fallback to `YEAR(created_at)`
- `user_id`: owner id

Response shape:

```json
{
  "albums": [
    {
      "id": 1,
      "user_id": 3,
      "title": "Trip to Hangzhou",
      "album_year": 2025,
      "cover_url": "/uploads/...",
      "created_at": "2026-05-13T10:00:00.000Z",
      "username": "alice",
      "nickname": "Alice",
      "avatar": "/uploads/avatars/...",
      "role": "user"
    }
  ]
}
```

### `GET /albums/:id`

Fetch one album by id.

Response shape:

```json
{
  "album": {
    "id": 1,
    "user_id": 3,
    "title": "Trip to Hangzhou",
    "album_year": 2025,
    "cover_url": "/uploads/...",
    "created_at": "2026-05-13T10:00:00.000Z",
    "username": "alice",
    "nickname": "Alice",
    "avatar": "/uploads/avatars/...",
    "role": "user"
  }
}
```

### `PUT /albums/:id`

Rename an album.

Request body:

```json
{
  "title": "Updated album title"
}
```

### `DELETE /albums/:id`

Delete an album.

Notes:

- the album owner can delete it
- media files remain and their album link is cleared by relational rules

### `PUT /albums/:id/cover`

Update album cover.

Supported modes:

- upload a new `cover` file
- send `cover_url` to reuse an existing album media item as cover

## Media

### `POST /media/upload`

Upload one or more files.

Content type:

- `multipart/form-data`

Fields:

- `files`: up to `10` files
- `album_id`
- `description`
- `event_time`

Notes:

- files are stored under `backend/uploads`
- supported formats: `jpg`, `jpeg`, `png`, `webp`, `mp4`, `mov`, `webm`
- media type is derived from browser metadata first, with file extension fallback
- single-file max size: image `10MB`, video `500MB`
- if every selected file fails validation, the request returns a `400` error instead of a zero-count success payload

Response shape:

```json
{
  "files": [
    {
      "id": 12,
      "url": "/uploads/example.mp4",
      "type": "video",
      "size": 174717460,
      "description": "Screen capture",
      "album_id": 3,
      "event_time": null
    }
  ],
  "count": 1
}
```

### `GET /media`

List media.

Supported query params:

- `album_id`
- `q`: search media description
- `type`: `image` or `video`
- `user_id`: uploader id
- `year`: uses `YEAR(event_time)`, falling back to `YEAR(created_at)`

Response shape:

```json
{
  "media": [
    {
      "id": 1,
      "user_id": 3,
      "album_id": 1,
      "url": "/uploads/...",
      "type": "image",
      "size": 12345,
      "description": "At the lake",
      "event_time": "2025-05-01T12:00:00.000Z",
      "created_at": "2026-05-13T10:00:00.000Z",
      "album_title": "Trip to Hangzhou",
      "username": "alice",
      "nickname": "Alice",
      "avatar": "/uploads/avatars/...",
      "role": "user"
    }
  ]
}
```

### `GET /media/:id/download`

Download a single media file as an attachment.

Notes:

- requires login
- returns the original stored file bytes
- response includes a suggested download filename

### `PUT /media/:id`

Update media description.

Request body:

```json
{
  "description": "Updated description"
}
```

Permissions:

- uploader or admin

### `DELETE /media/:id`

Delete a media item.

Permissions:

- uploader or admin

## Comments

### `POST /comments`

Create a comment or reply.

Request body:

```json
{
  "media_id": 10,
  "content": "Looks great",
  "parent_id": 2
}
```

Notes:

- `parent_id` is optional
- empty content is rejected

### `GET /comments/:mediaId`

Return comments for one media item as a nested tree.

Response shape:

```json
{
  "comments": [
    {
      "id": 1,
      "content": "Looks great",
      "parent_id": null,
      "replies": []
    }
  ]
}
```

### `DELETE /comments/:id`

Delete a comment.

Permissions:

- author or admin

## Admin

All admin endpoints are mounted under `/admin`.

### `GET /admin/users`

List users with aggregate counts.

Supported query params:

- `q`: search username or nickname
- `role`: `user` or `admin`

Response fields include:

- `album_count`
- `media_count`
- `comment_count`

### `PUT /admin/users/:id`

Update a user.

Typical request body:

```json
{
  "username": "alice",
  "nickname": "Alice",
  "role": "admin"
}
```

### `DELETE /admin/users/:id`

Delete a user.

Notes:

- cannot delete yourself
- cannot remove the last admin

### `GET /admin/albums`

List all albums.

Supported query params:

- `q`: search album title, owner username, or owner nickname
- `year`
- `user_id`

### `DELETE /admin/albums/:id`

Delete any album.

### `PUT /admin/albums/:id/cover`

Update any album cover.

Supported modes:

- upload a new `cover` file
- send `cover_url`

### `GET /admin/media`

List all media.

Supported query params:

- `album_id`
- `q`: search description, album title, uploader username, or uploader nickname
- `type`: `image` or `video`
- `user_id`
- `year`

### `DELETE /admin/media/:id`

Delete any media item.

## Search and filter implementation note

Search and filter logic is intentionally isolated from write logic.

- Backend read paths use dedicated query services
- Frontend read paths use `*Query` hooks
- Frontend write paths use `*Mutations` hooks

See `search-filter.md` for the deeper design notes.
