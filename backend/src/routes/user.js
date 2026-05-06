/**
 * 用户路由（受 JWT 保护）
 * GET /api/user/profile → 当前用户资料
 */

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const userController = require('../controllers/userController');

// 所有用户路由都需要登录
router.get('/user/profile', auth, userController.getProfile);

module.exports = router;
