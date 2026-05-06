/**
 * 路由汇总入口
 * 将所有子路由挂载到 /api 前缀下
 */

const express = require('express');
const router = express.Router();

const healthRoutes = require('./health');
const authRoutes = require('./auth');
const userRoutes = require('./user');
const mediaRoutes = require('./media');
const albumRoutes = require('./album');
const commentRoutes = require('./comment');

// 挂载健康检查路由（公开）
router.use(healthRoutes);

// 挂载认证路由（公开）
router.use(authRoutes);

// 挂载用户路由（受 JWT 保护）
router.use(userRoutes);

// 挂载媒体路由（受 JWT 保护）
router.use(mediaRoutes);

// 挂载相册路由（受 JWT 保护）
router.use(albumRoutes);

// 挂载评论路由（受 JWT 保护）
router.use(commentRoutes);

module.exports = router;
