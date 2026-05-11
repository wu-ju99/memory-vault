# Memory Vault — 项目快照

## 1. 项目基本信息

- **技术栈：** React 18 + Vite 5（前端），Node.js + Express 4（后端），MySQL 8.0（数据库）
- **仓库：** https://github.com/wu-ju99/memory-vault
- **分支：** master / admin（含管理员）/ no-admin（无管理员）
- **项目结构：**

```
memory-vault/
├── backend/
│   ├── sql/              # init_users/albums/media/comments.sql + migrate_profile.sql
│   ├── uploads/          # 媒体文件 + avatars/ 头像子目录
│   └── src/
│       ├── server.js / app.js
│       ├── config/       (db.js — mysql2/promise pool, jwt.js — secret 7d)
│       ├── middlewares/  (auth.js, logger.js, upload.js — multer UUID)
│       ├── routes/       (index.js 汇总, health, auth, user, media, album, comment)
│       ├── controllers/  (一一对应 routes)
│       └── services/     (一一对应 controllers)
├── frontend/
│   ├── src/
│   │   ├── main.jsx / App.jsx / config.js (BASE_URL) / index.css
│   │   ├── api/          (axios.js — baseURL=/api, 拦截器 Bearer token + 401)
│   │   ├── utils/        (auth.js — localStorage token/user 存取)
│   │   ├── components/   (AlbumCard, AvatarUploader, CommentList, MediaCard, NicknameEditor, ProtectedRoute, SearchBar)
│   │   └── pages/        (Login, Register, Home, AlbumDetail, Profile)
│   └── vite.config.js    (/api 和 /uploads 代理到 localhost:3000)
└── docs/                 (README, api, database, architecture, features, changelog, frontend, SNAPSHOT)
```

## 2. 已完成模块

- **后端：** 注册/登录 (bcrypt + JWT 7d)、JWT 鉴权中间件(req.user)、健康检查、用户资料查询、个人信息修改(PUT /api/user/update-profile: 昵称/头像 multipart/密码旧验证)、头像上传(multer → uploads/avatars UUID)、相册 CRUD、媒体上传(批量/图片10MB/视频500MB/事件时间)、媒体列表(共享模式+按相册筛)、媒体编辑/删除(权限控制)、评论 CRUD(树形回复+级联删除+管理员可删任意评论)、event_time、请求日志中间件
- **前端：** 登录/注册页(确认密码)、个人信息页(/profile: 头像上传+预览+昵称编辑+密码修改旧验证)、相册列表(首页 AlbumCard)、相册详情(MediaCard + CommentList 组合)、网格/时间轴双视图、图片/视频分区、描述内联编辑、删除(条件显示+管理员全权限)、评论(CommentList 自包含组件:递归渲染+回复+管理员删任意)、BASE_URL 直连后端图片、ProtectedRoute 路由守卫、axios 拦截器(token+401)、极简黑白灰 UI、7 个可复用组件
- **数据库：** users (id/username/nickname/avatar/password_hash/role/created_at)、albums (id/user_id FK→users CASCADE/title/created_at)、media (id/user_id FK→users CASCADE/album_id FK→albums SET NULL/url/type/size/description/event_time/created_at)、comments (id/user_id FK→users CASCADE/media_id FK→media CASCADE/parent_id FK→comments SET NULL/content/created_at)
- **配置：** MySQL 3306 root 无密码、JWT secret=memory-vault-dev-secret-key expiresIn=7d、BASE_URL=http://localhost:3000、multer 图片10MB/视频500MB/头像2MB

## 3. 当前正在开发的功能

- **正在做：** 无（所有已有功能完成）
- **未完成点：** SearchBar 组件已预留但未接入页面；admin 分支预留管理员独立开发

## 4. 重要约定

- **接口规范：** RESTful，Base `/api`，JSON 或 multipart/form-data（头像/上传），JWT Bearer token 鉴权
- **状态管理：** React useState/useEffect/useRef，无全局状态库。Token 存 localStorage，axios 拦截器自动附加
- **命名规范：** 文件 camelCase；后端三层 routes→controllers→services；前端 api/axios.js 统一封装；组件化拆分 components/ 目录
- **权限：** 公开路由(health/login/register)；auth 中间件注入 req.user{id,username,role}；编辑/删除需上传者本人或 role==='admin'
- **前端组件：** AlbumCard(album对象)、AvatarUploader(currentAvatarUrl,onAvatarSaved)、NicknameEditor(initialNickname,onNicknameSaved)、MediaCard(item+editing props+onDelete+children)、CommentList(mediaId,currentUserId,currentUserRole 自包含)、SearchBar(onSearch,placeholder 预留)
- **前端代理：** Vite 将 /api 和 /uploads 代理到 localhost:3000；媒体文件使用 BASE_URL 绝对路径

## 5. 最近修改 & 待解决问题

- **最近修改：** 管理员系统(role字段+红色标签+全权限删除)、组件化拆分(7组件)、个人信息完善(头像+昵称+密码旧验证)、注册确认密码、共享模式、event_time、时间轴、评论树形回复、评论窄栏排版修复、项目文档体系
- **当前 bug：** 无已知 bug
- **下一步计划：** SearchBar 接入页面实现搜索筛选；admin 分支独立开发管理员面板
