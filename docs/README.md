# Memory Vault — 项目文档

## 项目介绍

Memory Vault 是一个**私人照片/视频分享网站**。用户可以创建相册、上传图片和视频、为每个媒体添加描述和时间回忆，并支持评论互动。

## 技术栈

| 层 | 技术 |
|------|------|
| 前端 | React 18 + Vite 5 + React Router 6 |
| 后端 | Node.js + Express 4 |
| 数据库 | MySQL 8.0 (mysql2) |
| 认证 | JWT (jsonwebtoken) + bcryptjs |
| 上传 | multer |
| HTTP 客户端 | axios |

## 功能列表

- 用户注册/登录（JWT 鉴权）
- 相册创建与管理（支持用户选择相册年份）
- 首页按相册创建者分区，并支持用户导航定位
- 独立管理员面板（成员、相册、媒体管理）
- 图片/视频批量上传（10MB / 500MB 限制）
- 媒体描述编辑、删除
- 相册详情按上传者分区，单个用户内继续按图片/视频分区展示
- 评论系统（发表/删除/回复，窄栏中自适应换行）
- 按相册筛选媒体

## 项目结构

```
memory-vault/
├── backend/
│   ├── package.json
│   ├── sql/                          # 数据库初始化脚本
│   │   ├── init_users.sql
│   │   ├── init_albums.sql
│   │   ├── init_media.sql
│   │   ├── init_comments.sql
│   │   └── migrate_*.sql
│   ├── uploads/                      # 上传文件存储（已 gitignore）
│   └── src/
│       ├── server.js                 # 启动入口
│       ├── app.js                    # Express 应用初始化
│       ├── config/                   # db.js, jwt.js
│       ├── middlewares/              # auth, upload, logger
│       ├── routes/                   # 路由层
│       ├── controllers/              # 控制器层
│       └── services/                 # 服务层
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx                  # React 入口
│       ├── App.jsx                   # 路由表
│       ├── config.js                 # BASE_URL
│       ├── index.css                 # 全局样式
│       ├── api/axios.js              # Axios 实例（拦截器）
│       ├── utils/auth.js             # Token 工具
│       ├── components/               # ProtectedRoute
│       └── pages/                    # Login, Register, Home, AlbumDetail
└── docs/                             # 项目文档
```

## 启动方式

### 1. 数据库

```bash
# 确保 MySQL 运行，然后依次执行：
mysql -u root -p < backend/sql/init_users.sql
mysql -u root -p < backend/sql/init_media.sql
mysql -u root -p < backend/sql/init_albums.sql
mysql -u root -p < backend/sql/init_comments.sql
```

已有数据库升级时按需执行迁移脚本：

```bash
mysql -u root -p memory_vault < backend/sql/migrate_album_cover.sql
mysql -u root -p memory_vault < backend/sql/migrate_album_year.sql
```

### 2. 后端

```bash
cd backend
npm install
npm run dev          # → http://localhost:3000
```

### 3. 前端

```bash
cd frontend
npm install
npm run dev          # → http://localhost:5173
```

开发环境下，Vite 自动将 `/api` 和 `/uploads` 请求代理到后端 3000 端口。

## API 简要说明

| 模块 | 接口 | 说明 |
|------|------|------|
| 认证 | `POST /api/auth/register` | 注册 |
| | `POST /api/auth/login` | 登录，返回 JWT |
| 用户 | `GET /api/user/profile` | 当前用户资料 |
| 相册 | `POST/GET /api/albums` | 创建/列表 |
| 管理员 | `GET /api/admin/users` | 成员管理 |
| | `GET /api/admin/albums` | 全站相册管理 |
| | `GET /api/admin/media` | 全站媒体管理 |
| 媒体 | `POST /api/media/upload` | 上传（支持批量） |
| | `GET /api/media` | 列表（按相册筛选） |
| | `PUT /api/media/:id` | 编辑描述 |
| | `DELETE /api/media/:id` | 删除 |
| 评论 | `POST/GET/DELETE /api/comments` | 评论 CRUD |
| 系统 | `GET /api/health` | 健康检查 |

详见 [api.md](./api.md)

## 截图说明

| 页面 | 路径 | 说明 |
|------|------|------|
| 登录 | `/login` | 用户名/密码登录表单 |
| 注册 | `/register` | 创建新账号 |
| 首页 | `/` | 相册列表 + 新建相册 + 用户分区导航 |
| 相册详情 | `/album/:id` | 上传 + 上传者分区 + 图片/视频分区 + 评论 |

---

## 文档更新规则

每当新增功能，必须同步更新：

1. API 改动 → 更新 [api.md](./api.md)
2. 数据库改动 → 更新 [database.md](./database.md)
3. 新功能 → 更新 [features.md](./features.md)
4. 用户可见变化 → 更新本文件 (README.md)
5. 所有变更 → 写入 [changelog.md](./changelog.md)
