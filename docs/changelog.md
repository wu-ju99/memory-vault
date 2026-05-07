# 功能更新日志

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
