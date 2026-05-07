# Memory Vault — 项目快照

## 1. 项目基本信息

- **技术栈：** React 18 + Vite 5（前端），Node.js + Express 4（后端），MySQL 8.0（数据库）
- **项目结构：**

```
memory-vault/
├── backend/
│   ├── sql/           # init_users/albums/media/comments.sql
│   ├── uploads/       # 媒体文件存储（gitignored）
│   └── src/
│       ├── server.js / app.js
│       ├── config/    (db.js, jwt.js)
│       ├── middlewares/ (auth.js, logger.js, upload.js)
│       ├── routes/    (index, health, auth, user, media, album, comment)
│       ├── controllers/
│       └── services/
├── frontend/
│   ├── src/
│   │   ├── main.jsx / App.jsx / config.js / index.css
│   │   ├── api/       (axios.js)
│   │   ├── utils/     (auth.js)
│   │   ├── components/ (ProtectedRoute.jsx)
│   │   └── pages/     (Login, Register, Home, AlbumDetail)
│   └── vite.config.js
└── docs/              # README, api, database, architecture, features, changelog, frontend, snapshot
```

## 2. 已完成模块

- **后端：** 注册/登录 (bcrypt + JWT 7d)、JWT 鉴权中间件、健康检查、用户资料、相册 CRUD、媒体上传(批量/图片10MB/视频500MB)、媒体列表(共享模式+按相册筛)、媒体编辑/删除(权限控制)、评论 CRUD(树形回复+级联删除)、事件时间(event_time)、multer 文件存储(UUID命名)、请求日志中间件
- **前端：** 登录/注册页、相册列表(首页)、相册详情(上传+列表+评论)、网格/时间轴双视图、图片/视频分区、描述内联编辑、删除(条件显示)、评论(递归渲染+回复)、BASE_URL直连后端图片、ProtectedRoute路由守卫、axios拦截器(token+401)、极简黑白灰UI
- **数据库：** users (id/username/password_hash/role/created_at)、albums (id/user_id/title/created_at)、media (id/user_id/album_id/url/type/size/description/event_time/created_at)、comments (id/user_id/media_id/parent_id/content/created_at)。FK: users→albums CASCADE, users→media CASCADE, users→comments CASCADE, albums→media SET NULL, media→comments CASCADE
- **配置：** MySQL 3306 root 无密码、JWT secret=memory-vault-dev-secret-key expiresIn=7d、BASE_URL=http://localhost:3000

## 3. 当前正在开发的功能

- **正在做：** 无（所有已有功能完成）
- **未完成点：** 无

## 4. 重要约定

- **接口规范：** RESTful，Base URL `/api`，JSON 请求/响应，JWT Bearer token 鉴权
- **状态管理：** React useState/useEffect，无全局状态库。Token 存 localStorage，axios 拦截器自动附加
- **命名规范：** 文件 camelCase，后端三层：routes→controllers→services，前端 api/axios.js 统一封装请求
- **权限：** 公开路由(health/login/register)；受保护路由需 auth 中间件(注入 req.user)；编辑/删除需上传者本人或 admin
- **前端代理：** Vite 将 /api 和 /uploads 代理到 localhost:3000；媒体文件直接使用 BASE_URL 绝对路径加载

## 5. 最近修改 & 待解决问题

- **最近修改：** 共享模式(所有用户可见全部内容)、event_time 事件时间、时间轴视图、评论回复(树形结构)、项目文档体系(docs/)
- **当前 bug：** 无已知 bug
- **下一步计划：** 无待办
