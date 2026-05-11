# 数据库结构

数据库名：`memory_vault`
引擎：InnoDB | 字符集：utf8mb4 | 排序规则：utf8mb4_unicode_ci

---

## 表关系

```
users (1) ──< albums (many)     ON DELETE CASCADE
users (1) ──< media (many)      ON DELETE CASCADE
users (1) ──< comments (many)   ON DELETE CASCADE
albums (1) ──< media (many)     ON DELETE SET NULL
media (1) ──< comments (many)   ON DELETE CASCADE
```

---

## 1. users — 用户表

| 列名 | 类型 | 约束 | 默认值 | 说明 |
|------|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | — | 主键 |
| username | VARCHAR(50) | NOT NULL, UNIQUE | — | 用户名 |
| password_hash | VARCHAR(255) | NOT NULL | — | bcrypt 加密密码 |
| role | ENUM('user','admin') | NOT NULL | 'user' | 角色 |
| created_at | DATETIME | NOT NULL | CURRENT_TIMESTAMP | 注册时间 |

**索引：** PRIMARY KEY (id), UNIQUE KEY uk_username (username)

---

## 2. albums — 相册表

| 列名 | 类型 | 约束 | 默认值 | 说明 |
|------|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | — | 主键 |
| user_id | INT UNSIGNED | NOT NULL, FK→users(id) | — | 所属用户 |
| title | VARCHAR(100) | NOT NULL | — | 相册名称 |
| album_year | SMALLINT UNSIGNED | NULL | NULL | 相册年份（用户选择，用于首页年份分区） |
| cover_url | VARCHAR(500) | NULL | NULL | 相册封面地址 |
| created_at | DATETIME | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |

**索引：** PRIMARY KEY (id), KEY idx_user_id (user_id)

**外键：** fk_album_user — user_id → users(id) ON DELETE CASCADE

---

## 3. media — 媒体表

| 列名 | 类型 | 约束 | 默认值 | 说明 |
|------|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | — | 主键 |
| user_id | INT UNSIGNED | NOT NULL, FK→users(id) | — | 上传者 |
| album_id | INT UNSIGNED | NULL, FK→albums(id) | NULL | 所属相册（可空） |
| url | VARCHAR(500) | NOT NULL | — | 访问路径（如 /uploads/uuid.png） |
| type | ENUM('image','video') | NOT NULL | 'image' | 媒体类型 |
| size | INT UNSIGNED | NOT NULL | 0 | 文件大小（字节） |
| description | TEXT | NULL | NULL | 媒体描述 |
| event_time | DATETIME | NULL | NULL | 事件发生时间（用户可选） |
| created_at | DATETIME | NOT NULL | CURRENT_TIMESTAMP | 上传时间 |

**索引：** PRIMARY KEY (id), KEY idx_user_id (user_id), KEY idx_album_id (album_id), KEY idx_type (type), KEY idx_created_at (created_at)

**外键：**
- fk_media_user — user_id → users(id) ON DELETE CASCADE
- fk_media_album — album_id → albums(id) ON DELETE SET NULL

---

## 4. comments — 评论表

| 列名 | 类型 | 约束 | 默认值 | 说明 |
|------|------|------|------|------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | — | 主键 |
| user_id | INT UNSIGNED | NOT NULL, FK→users(id) | — | 评论者 |
| media_id | INT UNSIGNED | NOT NULL, FK→media(id) | — | 所属媒体 |
| parent_id | INT UNSIGNED | NULL | NULL | 父评论 ID（NULL=一级评论） |
| content | TEXT | NOT NULL | — | 评论内容 |
| created_at | DATETIME | NOT NULL | CURRENT_TIMESTAMP | 评论时间 |

**索引：** PRIMARY KEY (id), KEY idx_media_id (media_id), KEY idx_parent_id (parent_id)

**外键：**
- fk_comment_user — user_id → users(id) ON DELETE CASCADE
- fk_comment_media — media_id → media(id) ON DELETE CASCADE

---

## 共享模式说明

- `media` 和 `albums` 表通过 `user_id` 关联上传者
- API 查询时通过 `JOIN users` 获取 `username`
- 前端根据 `user_id` 判断是否显示删除按钮

## 初始化脚本

执行顺序：
1. `sql/init_users.sql` — 创建 users 表 + memory_vault 数据库
2. `sql/init_media.sql` — 创建 media 表
3. `sql/init_albums.sql` — 创建 albums 表 + media 添加 album_id
4. `sql/init_comments.sql` — 创建 comments 表

已有数据库迁移：
- `sql/migrate_album_cover.sql` — albums 增加 `cover_url`
- `sql/migrate_album_year.sql` — albums 增加 `album_year`，并用 `YEAR(created_at)` 初始化旧相册
