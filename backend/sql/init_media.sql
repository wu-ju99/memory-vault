-- ===================================================
-- Memory Vault - 媒体表 (media)
-- 关联 users 表，外键约束
-- ===================================================

USE memory_vault;

CREATE TABLE IF NOT EXISTS media (
  id          INT UNSIGNED   NOT NULL AUTO_INCREMENT  COMMENT '主键',
  user_id     INT UNSIGNED   NOT NULL                 COMMENT '上传用户 ID',
  url         VARCHAR(500)   NOT NULL                 COMMENT '文件访问路径',
  type        ENUM('image','video') NOT NULL DEFAULT 'image' COMMENT '媒体类型',
  size        INT UNSIGNED   NOT NULL DEFAULT 0       COMMENT '文件大小（字节）',
  description TEXT           DEFAULT NULL             COMMENT '媒体描述',
  created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',

  PRIMARY KEY (id),

  -- 外键关联 users 表，用户删除时级联删除其所有媒体
  CONSTRAINT fk_media_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,

  -- 索引
  KEY idx_user_id (user_id),
  KEY idx_type (type),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='媒体文件表';
