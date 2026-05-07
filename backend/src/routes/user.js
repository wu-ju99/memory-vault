/**
 * 用户路由（受 JWT 保护）
 * GET /api/user/profile        → 当前用户资料
 * PUT /api/user/update-profile → 修改用户资料（昵称、头像、密码）
 */

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const userController = require('../controllers/userController');

router.get('/user/profile', auth, userController.getProfile);
router.put('/user/update-profile', auth, userController.updateProfile);

module.exports = router;
