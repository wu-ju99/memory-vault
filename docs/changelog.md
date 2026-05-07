# 功能更新日志

## 2026-05-07（深夜）

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
