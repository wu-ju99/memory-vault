-- ===================================================
-- Memory Vault - 评论表 (comments)
-- ===================================================

USE memory_vault;

CREATE TABLE IF NOT EXISTS comments (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT  COMMENT '主键',
  user_id    INT UNSIGNED NOT NULL                 COMMENT '评论用户',
  media_id   INT UNSIGNED NOT NULL                 COMMENT '所属媒体',
  content    TEXT         NOT NULL                 COMMENT '评论内容',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',

  PRIMARY KEY (id),
  KEY idx_media_id (media_id),
  CONSTRAINT fk_comment_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_comment_media
    FOREIGN KEY (media_id) REFERENCES media (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';
