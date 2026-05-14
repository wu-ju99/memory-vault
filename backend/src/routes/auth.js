/**
 * 认证路由
 * POST /api/auth/register → 用户注册
 * POST /api/auth/login    → 用户登录
 * PUT  /api/auth/me       → 修改个人信息（需认证）
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimit');

router.post('/auth/register', authLimiter, authController.register);
router.post('/auth/login', authLimiter, authController.login);
router.put('/auth/me', authMiddleware, authController.updateProfile);

module.exports = router;
