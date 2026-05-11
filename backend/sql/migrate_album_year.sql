-- ===================================================
-- Memory Vault - albums 增加用户选择的相册年份
-- ===================================================

USE memory_vault;

ALTER TABLE albums
  ADD COLUMN album_year SMALLINT UNSIGNED DEFAULT NULL COMMENT '相册年份（用户选择）' AFTER title;

UPDATE albums
SET album_year = YEAR(created_at)
WHERE album_year IS NULL;
