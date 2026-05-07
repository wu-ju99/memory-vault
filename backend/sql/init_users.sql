-- ===================================================
-- Memory Vault - 用户表 (users)
-- 可直接在 MySQL 中执行
-- 用法: mysql -u root -p < init_users.sql
-- ===================================================

CREATE DATABASE IF NOT EXISTS memory_vault
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE memory_vault;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT  COMMENT '主键',
  username      VARCHAR(50)     NOT NULL                 COMMENT '用户名',
  nickname      VARCHAR(50)     NULL                     COMMENT '昵称',
  avatar        VARCHAR(500)    NULL                     COMMENT '头像路径',
  password_hash VARCHAR(255)    NOT NULL                 COMMENT '加密后的密码',
  role          ENUM('user', 'admin') NOT NULL DEFAULT 'user' COMMENT '角色: user=普通用户, admin=管理员',
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  PRIMARY KEY (id),
  UNIQUE  KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
