# 相册封面功能说明

更新时间：2026-05-11

## 功能范围

- 首页相册卡片支持直接点击“换封面”，不需要进入相册详情页。
- 所有登录用户都可以修改任意相册封面。
- 封面可以来自相册外部单独上传的图片。
- 相册详情页仍支持把相册内已有照片设为封面。
- 如果相册内照片被删除，并且该照片正被用作封面，后端会自动清空对应相册的 `cover_url`，避免封面残留。

## API

### PUT /api/albums/:id/cover

需要登录，路径参数 `id` 为相册 ID。

#### 上传外部图片作为封面

请求格式：`multipart/form-data`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| cover | File | 是 | jpg/jpeg/png/webp 图片，最大 10MB |

响应：

```json
{
  "message": "封面已更新",
  "cover_url": "/uploads/uuid.png"
}
```

#### 使用相册内已有照片作为封面

请求格式：`application/json`

```json
{
  "cover_url": "/uploads/uuid.png"
}
```

后端会校验 `cover_url` 必须属于当前相册内的图片。

## 数据库

`albums` 表新增字段：

| 字段 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| cover_url | VARCHAR(500) | NULL | 相册封面图片地址 |

新建库时已包含在 `backend/sql/init_albums.sql`。

已有数据库执行：

```sql
SOURCE backend/sql/migrate_album_cover.sql;
```

或直接执行：

```sql
ALTER TABLE albums
  ADD COLUMN cover_url VARCHAR(500) DEFAULT NULL COMMENT '相册封面地址' AFTER title;
```

## 前端行为

- `Home.jsx` 负责上传封面，并在成功后更新对应相册的 `cover_url`。
- `AlbumCard.jsx` 使用 `cover_url` 渲染封面图片。
- 上传成功后会追加 `cover_version` 查询参数，避免浏览器缓存导致新封面不显示。
- 上传失败会在首页展示后端返回的错误信息。
