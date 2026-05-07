-- ===================================================
-- Memory Vault - 用户表扩展（昵称 + 头像）
-- 在已有 users 表上执行
-- 用法: mysql -u root -p memory_vault < migrate_profile.sql
-- ===================================================

USE memory_vault;

-- 新增昵称和头像列
ALTER TABLE users
  ADD COLUMN nickname VARCHAR(50)  NULL     COMMENT '昵称' AFTER username,
  ADD COLUMN avatar   VARCHAR(500) NULL     COMMENT '头像路径' AFTER nickname;
