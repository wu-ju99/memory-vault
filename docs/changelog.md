# 功能更新日志

## 2026-05-12

### 新增：首页与相册详情按用户分区
- 首页相册列表改为按相册创建者分区，左页提供用户导航，点击可定位到对应用户的相册区。
- 相册详情页改为按媒体上传者分区，每个用户分区内继续保留照片/视频分区，便于区分同一相册中不同成员上传的内容。
- 单个用户分区内按时间倒序展示：相册按创建时间排序，媒体按拍摄时间 `event_time` 优先、否则按上传时间 `created_at` 排序。
- 新增独立 `useAlbumUsers`、`useMediaUsers`、`AlbumUserNav`、`AlbumUserSection`、`MediaUserSection`，页面只负责组合，避免分区逻辑混入上传、评论、封面、删除等功能。
- 后端相册和媒体列表补充返回 `nickname`，前端显示名优先使用昵称，没有昵称再回退到用户名。

| 改动 | 文件 | 说明 |
|------|------|------|
| 后端 | `albumService.js` / `mediaService.js` | 列表接口返回 `nickname` |
| 前端 | `useAlbumUsers.js` / `useMediaUsers.js` | 独立用户分组与排序逻辑 |
| 前端 | `AlbumUserNav.jsx` / `AlbumUserSection.jsx` / `MediaUserSection.jsx` | 用户导航、首页用户相册分区、详情用户媒体分区 |
| 前端 | `Home.jsx` / `AlbumDetail.jsx` | 接入用户分区组件，保留原上传、评论、删除、弹窗逻辑 |

---

### 修复：窄栏评论排版竖排问题
- 修复媒体详情弹窗右侧栏宽度较窄时，评论正文被日期、回复、删除按钮挤压成逐字竖排的问题。
- 评论正文现在独占下一行，用户名、管理员标签、日期和操作按钮保持在评论头部行，窄屏和长评论内容会自然换行。
- 本次只调整评论展示样式，不修改评论 API、提交、回复、删除或管理员权限逻辑，保持评论功能模块独立。

| 改动 | 文件 | 说明 |
|------|------|------|
| 样式 | `frontend/src/index.css` | 调整 `.comment-main` 内部排序和 `.comment-content` 换行策略 |

---

## 2026-05-11

### 新增：独立管理员管理面板
- 新增 `/admin` 管理面板，仅 `role=admin` 用户可访问。
- 管理员可查看全站成员信息和统计，可修改成员用户名、昵称、角色，可删除成员。
- 管理员可查看全站相册，删除任意相册，上传替换任意相册封面。
- 管理员可查看全站媒体，删除任意用户上传的媒体。
- 后端新增独立 `/api/admin/*` 路由和 `adminOnly` 中间件，避免管理员逻辑混入普通用户接口。
- 删除成员时会清理该成员上传的媒体文件和独立封面文件；删除媒体时复用已有媒体删除流程，清理文件和封面引用。

| 改动 | 文件 | 说明 |
|------|------|------|
| 后端 | `middlewares/adminOnly.js` / `routes/admin.js` / `controllers/adminController.js` | 独立管理员 API |
| 后端 | `adminUserService.js` / `adminAlbumService.js` / `adminMediaService.js` | 独立管理员业务服务 |
| 前端 | `AdminRoute.jsx` / `AdminDashboard.jsx` | 管理员路由保护和管理面板 |
| 前端 | `api/admin.js` / `useAdmin*.js` | 管理员 API 封装和状态 hook |
| 前端 | `components/admin/*` | 成员、相册、媒体管理展示组件 |

---

### 新增：相册年份选择与首页年份分区
- 创建相册时新增“相册年份”选择，年份独立于相册记录创建时间。
- 首页按 `albums.album_year` 分区展示相册，支持左侧年份导航和点击定位。
- 旧相册缺少 `album_year` 时前端回退到 `created_at` 年份；数据库迁移会用 `YEAR(created_at)` 初始化旧数据。
- 新增 `albums.album_year` 字段和迁移脚本 `backend/sql/migrate_album_year.sql`。
- 新增 `CreateAlbumForm`、`AlbumYearNav`、`AlbumYearSection` 和 `useAlbumYears`，保持创建表单、年份导航、分区展示、分组逻辑职责独立。
- 当前首页浏览分区已在 2026-05-12 调整为按用户分区；`album_year` 仍保留为相册年份字段和卡片显示信息。

| 改动 | 文件 | 说明 |
|------|------|------|
| 数据库 | `init_albums.sql` / `migrate_album_year.sql` | 增加 `albums.album_year` |
| 后端 | `albumController.js` / `albumManagementService.js` / `albumService.js` | 创建相册支持年份参数，列表返回并按年份排序 |
| 前端 | `CreateAlbumForm.jsx` / `useAlbumYears.js` | 相册年份输入、分组和滚动定位 |
| 前端 | `AlbumYearNav.jsx` / `AlbumYearSection.jsx` / `Home.jsx` | 首页年份导航和年份分区展示 |
| 文档 | `api.md` / `database.md` / `features.md` / `album-management.md` | 同步相册年份字段和迁移说明 |

---

### 重构：相册与媒体职责分离
- 后端控制器瘦身，业务规则下沉到专门服务。
- 新增 `albumManagementService`、`albumCoverService`、`mediaUploadService`、`mediaManagementService`、`fileStorageService`。
- 前端新增 `api/albums.js`、`api/media.js`、`useAlbums`、`useAlbumMedia`、`useMediaEditor`、`useMediaModal`。
- `Home.jsx` 和 `AlbumDetail.jsx` 只负责页面组合，减少功能堆叠。

---

### 新增：相册改名与删除
- 首页相册卡片新增“改名”“删除”操作。
- 只有相册创建者可以修改相册名称或删除相册。
- 后端新增 `PUT /api/albums/:id` 和 `DELETE /api/albums/:id`，并强制校验 `album.user_id === req.user.id`。
- 删除相册只删除相册记录，不删除照片/视频；媒体会按现有外键规则解除相册关联。
- 新建相册接口返回完整相册信息，创建后可立即显示创建者操作按钮。
- 新增说明文档：`docs/album-management.md`。

| 改动 | 文件 | 说明 |
|------|------|------|
| 后端 | `albumController.js` / `album.js` / `albumService.js` | 新增相册改名、删除和创建者权限校验 |
| 前端 | `Home.jsx` / `AlbumCard.jsx` | 创建者可在首页改名或删除相册 |
| 样式 | `index.css` | 新增相册管理按钮样式 |

---

### 新增：相册封面增强
- 首页相册卡片新增“换封面”入口，支持上传相册外部图片作为封面。
- 所有登录用户均可修改任意相册封面，符合当前共享相册模式。
- 相册详情页保留“设为相册封面”，可继续使用相册内已有照片作为封面。
- 删除媒体时，如果该媒体 URL 正被相册封面引用，会自动清空 `albums.cover_url`，避免封面残留。
- 新增 `PUT /api/albums/:id/cover`，支持 `multipart/form-data` 字段 `cover`，也兼容 JSON `cover_url`。
- `albums` 表新增 `cover_url` 字段；新增迁移脚本 `backend/sql/migrate_album_cover.sql`。
- 新增说明文档：`docs/album-cover.md`。

| 改动 | 文件 | 说明 |
|------|------|------|
| 后端 | `albumController.js` / `album.js` / `albumService.js` | 支持封面上传、相册内照片设封面、所有登录用户可改封面 |
| 后端 | `mediaService.js` | 删除被用作封面的媒体时自动清空相册封面 |
| 前端 | `Home.jsx` / `AlbumCard.jsx` | 首页相册卡片直接上传封面，成功后即时刷新显示 |
| 样式 | `index.css` | 新增相册封面按钮和封面图片样式 |
| 数据库 | `init_albums.sql` / `migrate_album_cover.sql` | 增加 `albums.cover_url` |

---

### 新增（codex/album-book-ui-step1~3 分支）
- **剪贴簿风格 UI 重构** — 首页和相册详情页改为书本翻页布局
- **拍立得相册卡片** — 相册卡片带随机倾斜角度，hover 回正动画
- **年份分组 + 书签导航** — 相册详情按年份分组，左侧年份书签快速跳转
- **抽卡式媒体弹窗** — 点击图片/视频打开全屏 modal，支持左右切换浏览
- **键盘快捷键** — Modal 支持 Escape 关闭、方向键切换

### 修复
- CSS `body` 重复声明导致登录页样式被覆盖 → 改为 `.scrapbook-page` 作用域
- Modal 关闭按钮无障碍（添加 aria-label）
- 评论区文字逐字断行 → 修复 flex 布局和 word-break 策略
- 移除前端 `package.json` 中无用的 `multer` 依赖

| 改动 | 文件 | 说明 |
|------|------|------|
| 前端 | `Home.jsx` | 书本翻页布局，左页创建相册，右页拍立得网格 |
| 前端 | `AlbumCard.jsx` | 拍立得卡片样式，随机倾斜 |
| 前端 | `AlbumDetail.jsx` | 左右分页布局、年份分组、媒体弹窗、键盘交互 |
| 前端 | `MediaCard.jsx` | 剪贴簿照片样式，点击打开弹窗 |
| 样式 | `index.css` | 新增 700+ 行剪贴簿主题样式，修复评论排版 |

---

### 新增
- **管理员系统** — `logintest` 设为 admin，管理员可删除任意媒体和评论

| 改动 | 文件 | 说明 |
|------|------|------|
| 后端 | `commentController.js` | delete 增加 `req.user.role !== 'admin'` 判断 |
| 后端 | `albumService.js` / `mediaService.js` / `commentService.js` | SELECT 增加 `u.role` |
| 前端 | `AlbumCard.jsx` / `MediaCard.jsx` / `CommentList.jsx` | 管理员昵称旁显示红色「管理员」标签 |
| 前端 | `CommentList.jsx` | 新增 `currentUserRole` prop，管理员可删任意评论 |
| 数据库 | `users` 表 | `UPDATE users SET role='admin' WHERE username='logintest'` |
| 样式 | `index.css` | 新增 `.admin-badge` 红色边框标签样式 |

---

## 2026-05-07（夜晚）

### 重构
- **组件化拆分** — 从页面中提取 7 个独立组件，props 清晰，职责单一

| 新建文件 | 来源 | 说明 |
|----------|------|------|
| `components/AlbumCard.jsx` | Home.jsx | 相册卡片 |
| `components/AvatarUploader.jsx` | Profile.jsx | 头像上传 |
| `components/NicknameEditor.jsx` | Profile.jsx | 昵称编辑 |
| `components/MediaCard.jsx` | AlbumDetail.jsx | 媒体卡片（children 注入评论） |
| `components/CommentList.jsx` | AlbumDetail.jsx | 自包含评论组件，独立管理状态和 API |
| `components/SearchBar.jsx` | 通用 | 搜索栏（预留） |

- **AlbumDetail.jsx** — 从 370 行精简至 215 行，移除评论状态（commentsMap/commentText/submitting/replyTo 等），通过 MediaCard + CommentList 组合
- **Profile.jsx** — 从 252 行精简至 122 行，头像/昵称逻辑提取到独立组件
- **Home.jsx** — 使用 AlbumCard 组件渲染列表

---

## 2026-05-07（傍晚）

### 新增
- **用户资料完善** — 头像上传（jpg/png/webp，≤2MB）、昵称编辑、密码修改（旧密码验证 + 新密码确认）
- **PUT /api/user/update-profile** — 新增接口，支持 multipart 上传头像 + 表单字段混合提交
- **数据库扩展** — users 表新增 `nickname`、`avatar` 列

### 变更
- `userService.js` — 新增 `updateProfile` 方法，独立处理昵称/头像/密码更新
- `userController.js` — 新增 avatarUpload multer 中间件（uploads/avatars/ 目录，UUID 命名）
- `Profile.jsx` — 重写：头像区域（点击更换 + hover 遮罩）、昵称输入行、密码独立区域
- `authService.js` — login/updateProfile 返回 nickname + avatar
- `index.css` — 新增 `.profile-*` 系列样式

---

## 2026-05-07（下午）

### 新增
- **注册确认密码** — 注册表单增加"确认密码"字段，前端 + 后端双重校验密码一致性，密码长度 ≥ 6
- **修改个人信息** — 新增个人信息编辑页 `/profile`，用户可修改用户名和密码（PUT /api/auth/me）

### 变更
- `POST /api/auth/register` — 新增必填参数 `confirm_password`
- 新增 `PUT /api/auth/me` — 修改当前用户个人信息接口
- `authService` — 新增 `updateProfile` 方法

---

## 2026-05-07（上午）

### 新增
- **评论回复系统** — 支持二级评论（树形结构），回复按钮 + 递归渲染，删除评论级联删除回复
- **事件时间（event_time）** — 上传时可设置回忆发生时间，前端优先展示 📷 拍摄时间，无则展示 📅 上传时间
- **共享模式** — 所有用户可查看全部相册与媒体，不再按 user_id 隔离
- **上传者显示** — 相册卡片和媒体卡片显示 `username`
- **条件删除按钮** — 仅上传者本人可看到删除按钮

### 变更
- `GET /api/albums` — 移除 user_id 过滤，JOIN users 返回 username
- `GET /api/media` — 移除 user_id 过滤，JOIN users 返回 username + user_id

---

## 2026-05-06

### 新增
- **用户认证系统** — 注册 (POST /api/auth/register) + 登录 (POST /api/auth/login)，JWT 7 天有效
- **JWT 鉴权中间件** — req.user 注入，401 拦截
- **媒体上传** — 图片/视频，multer 处理，UUID 文件名
- **批量上传** — upload.array('files', 10)，循环处理
- **视频支持** — mp4/mov/webm，500MB 上限，`<video controls>` 播放
- **相册系统** — albums 表，创建/列表/筛选 API，前端相册卡片+详情页
- **描述编辑** — PUT /api/media/:id，内联 textarea 编辑
- **删除功能** — DELETE /api/media/:id，磁盘文件 + DB 记录同步删除
- **图片/视频分区** — AlbumDetail 按 type 分组，分区标题
- **评论系统** — comments 表，发表/列表/删除 API，前端 💬 展开
- **BASE_URL 配置** — 图片直连后端，不经过 Vite 代理
- **路由保护** — ProtectedRoute 组件
- **前端 Axios 拦截器** — 自动 Bearer token + 401 自动登出
- **项目文档体系** — docs/ 目录，覆盖 API/数据库/架构/功能清单

### 优化
- 图片访问路径：从前端代理改为后端绝对 URL
- 删除按钮：hover 显示 + z-index 层级修复
- 静态文件服务：express.static + Vite /uploads 代理

---

## 2026-05-06（初期）

### 新增
- 基础项目结构（Express + React + Vite）
- 健康检查接口 GET /api/health
- MySQL 连接池配置
- 请求日志中间件
- 登录/注册页面 UI
- 图片网格展示
