-- ===================================================
-- Memory Vault - 相册表 (albums)
-- ===================================================

USE memory_vault;

CREATE TABLE IF NOT EXISTS albums (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT  COMMENT '主键',
  user_id    INT UNSIGNED  NOT NULL                 COMMENT '所属用户',
  title      VARCHAR(100)  NOT NULL                 COMMENT '相册名称',
  cover_url  VARCHAR(500)  DEFAULT NULL             COMMENT '相册封面地址',
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  CONSTRAINT fk_album_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='相册表';

-- media 表增加 album_id 外键（可空，兼容旧数据）
ALTER TABLE media
  ADD COLUMN album_id INT UNSIGNED DEFAULT NULL COMMENT '所属相册' AFTER user_id,
  ADD KEY idx_album_id (album_id),
  ADD CONSTRAINT fk_media_album
    FOREIGN KEY (album_id) REFERENCES albums (id)
    ON DELETE SET NULL;
