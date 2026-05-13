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
  api/albums.js       — 相册/封面 API 封装
  api/media.js        — 媒体 API 封装
  hooks/useAlbums.js      — 首页相册列表、创建、改名、删除、封面上传状态
  hooks/useAlbumYears.js  — 首页按 album_year 分组、年份导航定位状态
  hooks/useAlbumUsers.js  — 首页年份内按相册创建者分组
  hooks/useYearUserNav.js — 首页年份导航下的用户子导航数据
  hooks/useAlbumMedia.js  — 相册详情页数据、年份分组、上传、删除、设封面状态
  hooks/useMediaUsers.js  — 相册详情年份内按媒体上传者分组状态
  hooks/useMediaEditor.js — 媒体描述编辑状态
  hooks/useMediaModal.js  — 媒体预览弹窗状态
  api/admin.js            — 管理员 API 封装
  hooks/useAdminUsers.js  — 管理员成员列表、编辑、删除状态
  hooks/useAdminAlbums.js — 管理员相册列表、删除、封面状态
  hooks/useAdminMedia.js  — 管理员媒体列表、删除状态
  utils/auth.js       — localStorage 读写 (getToken/saveAuth/clearAuth/isAuthenticated)
  config.js           — BASE_URL = 'http://localhost:3000'
  components/ProtectedRoute.jsx — 路由守卫
```

## 后端职责边界

- `controllers/*`：HTTP 参数入口、响应格式、错误转交。
- `routes/*`：路由挂载、中间件组合，不写业务规则。
- `services/albumService.js`：相册表基础数据操作。
- `services/albumManagementService.js`：相册创建、改名、删除和创建者权限规则。
- `services/albumCoverService.js`：上传封面、选择相册内照片设封面、媒体删除后的封面引用清理。
- `services/mediaService.js`：媒体表基础数据操作。
- `services/mediaUploadService.js`：媒体上传文件分类、大小校验和入库编排。
- `services/mediaManagementService.js`：媒体编辑、删除权限和删除副作用编排。
- `services/fileStorageService.js`：上传文件路径、URL 和文件删除。
- `middlewares/adminOnly.js`：管理员接口权限边界。
- `routes/admin.js` / `controllers/adminController.js`：独立管理员接口入口。
- `services/adminUserService.js` / `adminAlbumService.js` / `adminMediaService.js`：管理员业务服务，避免混入普通用户流程。

## 数据关系

```
users (1) ──< albums (many)     ON DELETE CASCADE
users (1) ──< media (many)      ON DELETE CASCADE
users (1) ──< comments (many)   ON DELETE CASCADE
albums (1) ──< media (many)     ON DELETE SET NULL
media (1) ──< comments (many)   ON DELETE CASCADE
```
