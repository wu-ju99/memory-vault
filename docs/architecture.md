# 项目架构

## 总体架构

```
┌──────────────────────────────────────────────────────────┐
│ 浏览器 (localhost:5173)                                  │
│  React SPA (Vite dev server)                             │
│  ┌─────────┐  ┌──────────┐  ┌─────────────────────────┐ │
│  │ /login  │  │ /register│  │ / (相册) → /album/:id    │ │
│  └─────────┘  └──────────┘  └─────────────────────────┘ │
│         │                        │                      │
│         │    Vite Proxy          │                      │
│         │    /api → :3000        │  绝对 URL             │
│         │    /uploads → :3000    │  BASE_URL + path      │
└─────────┼────────────────────────┼──────────────────────┘
          │                        │
          ▼                        ▼
┌─────────────────────────────────────────────────────────┐
│ Express Server (localhost:3000)                          │
│                                                         │
│  Middleware Stack:                                       │
│    express.json() → requestLogger → /uploads (static)   │
│         → /api (routes) → error handler                 │
│                                                         │
│  Layers:                                                 │
│    routes → controllers → services → MySQL (mysql2)     │
│                                                         │
│  Auth: JWT middleware (req.user)                         │
│  Upload: multer (diskStorage, /uploads)                  │
│                                                         │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ MySQL 8.0                                               │
│  memory_vault database                                  │
│  ┌────────┐ ┌────────┐ ┌───────┐ ┌──────────┐         │
│  │ users  │ │ albums  │ │ media │ │ comments │         │
│  └────────┘ └────────┘ └───────┘ └──────────┘         │
└─────────────────────────────────────────────────────────┘
```

## 请求流程

### 认证请求

```
POST /api/auth/login { username, password }
  → authController.login()
    → authService.login()
      → users 表查询
      → bcrypt.compare()
      → jwt.sign({ id, username, role }, secret, { expiresIn: '7d' })
      → { token, user }
```

### 媒体上传请求

```
POST /api/media/upload (multipart/form-data)
  → auth middleware (验证 JWT，注入 req.user)
  → multer array('files', 10)
    → 文件写入 backend/uploads/UUID.ext
    → 写入 req.files[]
  → mediaController.upload()
    → detectType(mimetype) → image / video
    → 分类型大小校验
    → mediaService.createMedia()
      → INSERT INTO media
      → { id, url, type, size, description, album_id }
    → 201 + { files, count }
```

### 静态资源访问

```
浏览器请求 http://localhost:3000/uploads/UUID.png
  → Express: app.use('/uploads', express.static('backend/uploads'))
  → 直接返回文件，Content-Type: image/png
```

## 前端架构

```
main.jsx
  └─ BrowserRouter
       └─ App.jsx (Routes)
            ├─ /login       → Login.jsx       (公开)
            ├─ /register    → Register.jsx    (公开)
            ├─ /album/:id   → ProtectedRoute → AlbumDetail.jsx
            ├─ /            → ProtectedRoute → Home.jsx
            └─ *            → Navigate to /

共享模块:
  api/axios.js        — 统一 Axios 实例 (baseURL=/api, Bearer token 拦截, 401 自动登出)
  utils/auth.js       — localStorage 读写 (getToken/saveAuth/clearAuth/isAuthenticated)
  config.js           — BASE_URL = 'http://localhost:3000'
  components/ProtectedRoute.jsx — 路由守卫
```

## 数据关系

```
users (1) ──< albums (many)     ON DELETE CASCADE
users (1) ──< media (many)      ON DELETE CASCADE
users (1) ──< comments (many)   ON DELETE CASCADE
albums (1) ──< media (many)     ON DELETE SET NULL
media (1) ──< comments (many)   ON DELETE CASCADE
```
