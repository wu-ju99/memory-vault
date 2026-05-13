# 前端结构

## 路由表

| 路径 | 页面组件 | 鉴权 | 说明 |
|------|---------|------|------|
| `/login` | Login.jsx | 公开 | 登录表单 |
| `/register` | Register.jsx | 公开 | 注册表单 |
| `/` | Home.jsx | ProtectedRoute | 相册列表 + 新建相册 |
| `/album/:id` | AlbumDetail.jsx | ProtectedRoute | 相册详情（上传+展示+评论） |
| `*` | — | — | 重定向到 `/` |

## 页面说明

### Login.jsx (`/login`)

- 用户名 + 密码表单
- 调用 `POST /api/auth/login`
- 成功后 `saveAuth(token, user)` → 跳转 `/`
- 失败显示错误消息
- 读取 `location.state.message` 显示绿色成功提示（注册后跳转）
- 链接到 `/register`

### Register.jsx (`/register`)

- 用户名 + 密码表单
- 调用 `POST /api/auth/register`
- 成功后跳转 `/login` 并传递 `{ state: { message: '注册成功，请登录' } }`
- 链接到 `/login`

### Home.jsx (`/`)

- 加载相册列表 `GET /api/albums`
- 按相册年份主分区展示，年份内再按相册创建者分区
- 左页 `AlbumYearNav` 提供年份导航，`AlbumUserNav` 作为当前年份用户子导航
- 卡片网格展示（`Link` 到 `/album/:id`）
- 新建相册输入框 + 创建按钮
- 相册改名和删除使用独立站内弹窗，不再使用浏览器原生白框
- 显示当前用户名 + 退出按钮
- 空状态："还没有相册，创建一个吧"

### AlbumDetail.jsx (`/album/:id`)

**数据加载：**
- 并行请求：`GET /api/albums` + `GET /api/media?album_id=:id`
- 从 albums 数组中找到匹配的相册对象

**上传：**
- 文件选择（`multiple`，图片+视频格式）
- 支持 `jpg/jpeg/png/webp/mp4/mov/webm`
- 图片最大 `10MB`，视频最大 `500MB`
- 描述 textarea
- 自动绑定当前相册 album_id
- FormData 构建 → POST /api/media/upload
- 上传成功后刷新媒体列表
- 当所有已选文件都未通过格式或大小校验时，前端直接显示明确错误，不再出现“0 个文件”的假成功提示

**媒体展示：**
- 按年份主分区展示，年份内再按上传者分区
- 每个上传者分区内继续按图片 / 视频分组，并按 `event_time` / `created_at` 倒序
- `renderMediaCard()` 提取函数，复用媒体卡片、评论、删除、弹窗逻辑
- 单个媒体下载能力独立接入 `MediaCard` 和 `MediaModal`，不与上传/删除 hook 混用

**卡片功能：**
- 图片：`<a>` 新标签页打开原图
- 视频：`<video controls>` 原生播放
- 下载：卡片和预览弹窗都可直接下载原文件
- 描述：点击进入内联编辑，保存/取消
- 时间：`formatDate()` 格式化 YYYY-MM-DD
- 删除：右上角 × 按钮（hover 显示），使用独立站内确认弹窗
- 评论：💬 按钮展开/收起，发表/删除
- 评论排版：`CommentList.jsx` 负责评论交互状态，`index.css` 负责窄栏换行和视觉布局，避免把评论逻辑混入页面组件

### AdminDashboard.jsx (`/admin`)

- 成员、相册、媒体三个后台分区共用独立筛选工具栏
- 删除成员、删除相册、删除媒体统一使用共享确认弹窗
- 相册和媒体分区支持独立勾选、全选、清空选择、批量删除
- 删除弹窗由页面负责打开和提交，公共弹窗组件只负责展示与交互壳层

## 共享模块

| 模块 | 路径 | 作用 |
|------|------|------|
| Axios 实例 | `api/axios.js` | baseURL=/api，自动 Bearer token，401 自动登出 |
| Token 工具 | `utils/auth.js` | getToken / saveAuth / clearAuth / isAuthenticated / getUser |
| 路由守卫 | `components/ProtectedRoute.jsx` | 无 token → Navigate to /login |
| 年份分组 | `hooks/useAlbumYears.js` / `hooks/useAlbumMedia.js` | 首页相册年份分区、详情媒体年份分区 |
| 用户分组 | `hooks/useAlbumUsers.js` / `hooks/useMediaUsers.js` / `hooks/useYearUserNav.js` | 年份内用户分区和首页用户子导航，保持分组逻辑独立 |
| 用户显示名 | `utils/userDisplay.js` | 昵称优先，未设置昵称时回退用户名 |
| 用户头像 | `components/UserAvatar.jsx` / `components/UserIdentity.jsx` | 统一头像、显示名、管理员标识和缺省头像展示，供相册、媒体、评论、分区和管理员面板复用 |
| 站内弹窗 | `components/dialogs/*` | 统一危险操作确认和文本输入弹窗，替换原生 confirm/prompt |
| 媒体下载 | `hooks/useMediaDownload.js` | 单个媒体下载状态与浏览器文件保存流程，保持与上传/删除解耦 |
| 全局配置 | `config.js` | BASE_URL = 'http://localhost:3000' |
| 全局样式 | `index.css` / `styles/dialog.css` | 站点基础样式与独立弹窗样式 |

## 数据流

```
用户操作 → 页面组件 → api (axios) → 请求拦截器附加 token
    → Vite 代理 (/api → :3000) 或 绝对 URL (:3000/uploads)
    → Express 后端 → MySQL
    ← JSON 响应
    → 响应拦截器（401 → 自动登出）
    → 组件 setState → 重新渲染
```

## 认证流程

```
登录成功 → saveAuth(token, user) → localStorage
刷新页面 → getToken() → isAuthenticated() → true → 保持登录
401 响应 → clearAuth() → window.location = '/login'
登出按钮 → clearAuth() → navigate('/login')
```
