/**
 * 认证路由
 * POST /api/auth/register → 用户注册
 * POST /api/auth/login    → 用户登录
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

module.exports = router;
