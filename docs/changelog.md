# 功能更新日志

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
