-- ===================================================
-- Memory Vault - 相册封面字段迁移
-- ===================================================

USE memory_vault;

ALTER TABLE albums
  ADD COLUMN cover_url VARCHAR(500) DEFAULT NULL COMMENT '相册封面地址' AFTER title;
