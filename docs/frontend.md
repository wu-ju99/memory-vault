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
- 按相册创建者分区展示，单个用户内按创建时间倒序
- 左页 `AlbumUserNav` 提供用户导航，点击定位到对应用户相册区
- 卡片网格展示（`Link` 到 `/album/:id`）
- 新建相册输入框 + 创建按钮
- 显示当前用户名 + 退出按钮
- 空状态："还没有相册，创建一个吧"

### AlbumDetail.jsx (`/album/:id`)

**数据加载：**
- 并行请求：`GET /api/albums` + `GET /api/media?album_id=:id`
- 从 albums 数组中找到匹配的相册对象

**上传：**
- 文件选择（`multiple`，图片+视频格式）
- 描述 textarea
- 自动绑定当前相册 album_id
- FormData 构建 → POST /api/media/upload
- 上传成功后刷新媒体列表

**媒体展示：**
- 按上传者分区，单个用户内按 `event_time` / `created_at` 倒序
- 每个上传者分区内继续按图片 / 视频分组
- `renderMediaCard()` 提取函数，复用媒体卡片、评论、删除、弹窗逻辑

**卡片功能：**
- 图片：`<a>` 新标签页打开原图
- 视频：`<video controls>` 原生播放
- 描述：点击进入内联编辑，保存/取消
- 时间：`formatDate()` 格式化 YYYY-MM-DD
- 删除：右上角 × 按钮（hover 显示），确认删除
- 评论：💬 按钮展开/收起，发表/删除
- 评论排版：`CommentList.jsx` 负责评论交互状态，`index.css` 负责窄栏换行和视觉布局，避免把评论逻辑混入页面组件

## 共享模块

| 模块 | 路径 | 作用 |
|------|------|------|
| Axios 实例 | `api/axios.js` | baseURL=/api，自动 Bearer token，401 自动登出 |
| Token 工具 | `utils/auth.js` | getToken / saveAuth / clearAuth / isAuthenticated / getUser |
| 路由守卫 | `components/ProtectedRoute.jsx` | 无 token → Navigate to /login |
| 用户分组 | `hooks/useAlbumUsers.js` / `hooks/useMediaUsers.js` | 首页相册和详情媒体按用户分区，保持分组逻辑独立 |
| 用户显示名 | `utils/userDisplay.js` | 昵称优先，未设置昵称时回退用户名 |
| 全局配置 | `config.js` | BASE_URL = 'http://localhost:3000' |
| 全局样式 | `index.css` | 极简黑白灰风格，无 UI 框架 |

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
