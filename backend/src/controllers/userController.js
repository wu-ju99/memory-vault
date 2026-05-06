/**
 * 用户控制器 — 处理用户相关 HTTP 请求
 * 受 JWT 鉴权保护，从 req.user 获取当前用户信息
 */

const userService = require('../services/userService');

/**
 * GET /api/user/profile
 * 返回当前登录用户的资料
 */
async function getProfile(req, res, next) {
  try {
    const user = await userService.getProfile(req.user.id);
    res.json({ user });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
}

module.exports = { getProfile };
