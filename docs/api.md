# API 文档

Base URL: `http://localhost:3000/api`

所有需要认证的接口需在 Header 中传入：
```
Authorization: Bearer <token>
```

---

## 1. 系统

### GET /api/health

健康检查（公开）。

**响应：**
```json
{
  "status": "ok",
  "timestamp": "2026-05-06T12:00:00.000Z",
  "uptime": 123.45
}
```

---

## 2. 认证

### POST /api/auth/register

用户注册（公开）。

**请求体：**
```json
{ "username": "string", "password": "string", "confirm_password": "string" }
```
> `confirm_password` 必须与 `password` 一致，密码长度 ≥ 6。

**响应：**
| 状态码 | 响应体 |
|------|------|
| 201 | `{ "message": "注册成功" }` |
| 400 | `{ "message": "用户名不能为空" }` 或 `{ "message": "密码不能为空" }` 或 `{ "message": "密码长度不能少于 6 位" }` 或 `{ "message": "两次密码输入不一致" }` |
| 409 | `{ "message": "用户名已存在" }` |

---

### POST /api/auth/login

用户登录（公开），返回 JWT token（7 天有效）。

**请求体：**
```json
{ "username": "string", "password": "string" }
```

**响应：**
| 状态码 | 响应体 |
|------|------|
| 200 | `{ "token": "eyJ...", "user": { "id": 1, "username": "xxx", "role": "user" } }` |
| 401 | `{ "message": "用户名或密码错误" }` |

---

### PUT /api/auth/me

修改当前登录用户的个人信息（需认证）。

**请求体：**
```json
{ "username": "string", "password": "string?", "confirm_password": "string?" }
```
> `password` 和 `confirm_password` 为可选字段。不填则不修改密码；填写时必须一致且长度 ≥ 6。

**响应：**
| 状态码 | 响应体 |
|------|------|
| 200 | `{ "user": { "id": 1, "username": "xxx", "role": "user", "created_at": "..." } }` |
| 400 | `{ "message": "用户名不能为空" }` 或 `{ "message": "密码长度不能少于 6 位" }` 或 `{ "message": "两次密码输入不一致" }` |
| 409 | `{ "message": "用户名已被占用" }` |

---

## 3. 用户

### GET /api/user/profile

获取当前用户资料（需认证）。

**响应：**
| 状态码 | 响应体 |
|------|------|
| 200 | `{ "user": { "id": 1, "username": "xxx", "nickname": "...", "avatar": "/uploads/avatars/...", "role": "user", "created_at": "..." } }` |
| 401 | `{ "message": "未提供认证令牌" }` |

---

### PUT /api/user/update-profile

修改当前用户资料 — 昵称、头像、密码（需认证）。

**请求格式：** `multipart/form-data`

**参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | string | 否 | 新昵称 |
| avatar | file | 否 | 头像图片（jpg/png/webp，≤2MB） |
| oldPassword | string | 条件 | 修改密码时必填，当前密码 |
| newPassword | string | 条件 | 修改密码时必填，新密码（≥6 位） |
| confirmPassword | string | 条件 | 修改密码时必填，与新密码一致 |

> 昵称、头像、密码可独立操作，互不影响。密码修改需验证旧密码。

**响应：**
| 状态码 | 响应体 |
|------|------|
| 200 | `{ "user": { "id": 1, "username": "xxx", "nickname": "...", "avatar": "...", "role": "user", "created_at": "..." } }` |
| 400 | `{ "message": "请输入旧密码" }` 或 `{ "message": "旧密码不正确" }` 或 `{ "message": "头像文件不能超过 2MB" }` |
| 401 | `{ "message": "未提供认证令牌" }` |

---

## 4. 相册

### POST /api/albums

创建相册（需认证）。

**请求体：**
```json
{
  "title": "2020 日本旅行",
  "album_year": 2020
}
```

`album_year` 为用户选择的相册年份，缺省时后端使用当前年份。

**响应：**
| 状态码 | 响应体 |
|------|------|
| 201 | `{ "id": 1, "user_id": 2, "title": "2020 日本旅行", "album_year": 2020, "cover_url": null, "created_at": "...", "username": "user", "role": "user" }` |
| 400 | `{ "message": "相册名称不能为空" }` 或 `{ "message": "相册年份必须在 1900 到 2027 之间" }` |

---

### GET /api/albums

获取所有相册列表（需认证），按相册年份倒序、创建时间倒序。**共享模式：返回所有用户的相册。**

**响应：**
```json
{
  "albums": [
    { "id": 1, "user_id": 2, "title": "2020 日本旅行", "album_year": 2020, "cover_url": null, "username": "logintest", "created_at": "2026-05-06T..." }
  ]
}
```

---

## 5. 媒体

### POST /api/media/upload

上传媒体文件（需认证）。字段名 `files`，最多 10 个文件。

**请求格式：** `multipart/form-data`

**参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| files | File[] | 是 | 图片或视频文件（最多 10 个） |
| description | string | 否 | 描述文字 |
| event_time | string | 否 | 事件发生时间（datetime 格式） |
| album_id | number | 否 | 归属相册 ID |

**格式限制：**

| 类型 | 扩展名 | 大小上限 |
|------|------|------|
| 图片 | jpg, jpeg, png, webp | 10 MB |
| 视频 | mp4, mov, webm | 500 MB |

**响应：**
| 状态码 | 响应体 |
|------|------|
| 201 | `{ "files": [{ "id": 1, "url": "/uploads/uuid.png", "type": "image", "size": 12345, "description": "", "album_id": 1 }], "count": 1 }` |
| 400 | `{ "message": "请选择要上传的文件" }` |
| 400 | `{ "message": "单个文件大小不能超过 500MB" }` |
| 400 | `{ "message": "一次最多上传 10 个文件" }` |

---

### GET /api/media

获取所有用户的媒体列表（需认证），按上传时间倒序。**共享模式：返回所有用户的媒体。**

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| album_id | number | 否 | 按相册筛选 |

**响应：**
```json
{
  "media": [
    {
      "id": 1,
      "user_id": 2,
      "username": "logintest",
      "album_id": 1,
      "album_title": "2026 春游",
      "url": "/uploads/uuid.png",
      "type": "image",
      "size": 12345,
      "description": "日落",
      "event_time": "2025-03-15T08:30:00.000Z",
      "created_at": "2026-05-06T12:00:00.000Z"
    }
  ]
}
```

---

### PUT /api/media/:id

更新媒体描述（需认证，仅上传者或管理员）。

**请求体：**
```json
{ "description": "新的描述" }
```

**响应：**
| 状态码 | 响应体 |
|------|------|
| 200 | 完整的 media 对象 |
| 400 | `{ "message": "description 字段不能为空" }` |
| 403 | `{ "message": "无权修改该媒体" }` |
| 404 | `{ "message": "媒体不存在" }` |

---

### DELETE /api/media/:id

删除媒体（需认证，仅上传者或管理员）。同时删除数据库记录和磁盘文件。

**响应：**
| 状态码 | 响应体 |
|------|------|
| 200 | `{ "message": "删除成功" }` |
| 403 | `{ "message": "无权删除该媒体" }` |
| 404 | `{ "message": "媒体不存在" }` |

---

## 6. 评论

### POST /api/comments

发表评论（需认证）。

**请求体：**
```json
{ "media_id": 1, "content": "好美的照片！", "parent_id": null }
```
> `parent_id` 为可选字段，传入时表示回复某条评论。

**响应：**
| 状态码 | 响应体 |
|------|------|
| 201 | `{ "id": 1 }` |
| 400 | `{ "message": "media_id 不能为空" }` 或 `{ "message": "评论内容不能为空" }` |

---

### GET /api/comments/:mediaId

获取某个媒体的评论列表（需认证），**已构建为树形结构（含 replies）**。

**响应：**
```json
{
  "comments": [
    {
      "id": 1,
      "media_id": 1,
      "parent_id": null,
      "user_id": 2,
      "username": "logintest",
      "content": "好美的照片！",
      "created_at": "2026-05-06T12:00:00.000Z",
      "replies": [
        {
          "id": 2,
          "parent_id": 1,
          "username": "testuser",
          "content": "谢谢！",
          "replies": []
        }
      ]
    }
  ]
}
```

---

### DELETE /api/comments/:id

删除评论（需认证，仅评论作者）。**级联删除：同时删除该评论的所有回复。**

**响应：**
| 状态码 | 响应体 |
|------|------|
| 200 | `{ "message": "删除成功" }` |
| 403 | `{ "message": "无权删除" }` |
| 404 | `{ "message": "评论不存在" }` |

---

## 7. 管理员

所有管理员接口都需要登录且 `user.role === 'admin'`，统一路径前缀为 `/api/admin`。

### GET /api/admin/users

查看所有成员，包含相册、媒体、评论数量统计。

### PUT /api/admin/users/:id

管理员更新成员资料。

**请求体：**
```json
{ "username": "newname", "nickname": "昵称", "role": "admin" }
```

安全限制：不能移除最后一个管理员。

### DELETE /api/admin/users/:id

管理员删除成员。不能删除自己，不能删除最后一个管理员。删除前会清理该用户上传的媒体文件和相册封面文件。

### GET /api/admin/albums

查看全站相册列表。

### DELETE /api/admin/albums/:id

管理员删除任意相册。删除相册不会删除相册内媒体，媒体会按外键规则解除相册关联。

### PUT /api/admin/albums/:id/cover

管理员更新任意相册封面。支持上传 `cover` 文件。

### GET /api/admin/media

查看全站媒体列表，支持 `user_id`、`album_id`、`type` 查询参数。

### DELETE /api/admin/media/:id

管理员删除任意媒体，同时删除物理文件并清理引用该媒体的相册封面。

---

## 用户身份字段补充

下列列表接口会返回用于前端头像身份展示的用户字段：`username`、`nickname`、`avatar`、`role`。前端统一通过 `UserIdentity` 组件消费这些字段，避免每个页面重复拼装头像逻辑。

| 接口 | 身份字段用途 |
|------|------|
| `GET /api/albums` | 相册卡片、首页年份内用户分区、管理员相册创建者 |
| `GET /api/media` | 媒体卡片、相册详情上传者分区、媒体弹窗 |
| `GET /api/comments/:mediaId` | 评论作者和回复占位名称 |
| `GET /api/admin/users` | 管理员成员列表 |
| `GET /api/admin/media` | 管理员媒体上传者 |

---

## 认证错误统一响应

所有受保护接口在 token 无效时返回：

| 场景 | 状态码 | 响应体 |
|------|------|------|
| 无 token | 401 | `{ "message": "未提供认证令牌" }` |
| 格式错误 | 401 | `{ "message": "认证格式错误" }` |
| token 过期/无效 | 401 | `{ "message": "令牌无效或已过期" }` |
