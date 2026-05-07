/**
 * 认证控制器 — 处理认证相关 HTTP 请求
 * 解析请求参数，调用服务层，返回响应
 */

const authService = require('../services/authService');

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { username, password, confirm_password } = req.body;
    const result = await authService.register(username, password, confirm_password);
    res.status(201).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
}

/**
 * PUT /api/auth/me — 修改个人信息
 */
async function updateProfile(req, res, next) {
  try {
    const { username, password, confirm_password } = req.body;
    const result = await authService.updateProfile(
      req.user.id,
      username,
      password,
      confirm_password
    );
    res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
}

module.exports = { register, login, updateProfile };
