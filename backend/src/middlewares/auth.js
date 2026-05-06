/**
 * JWT 鉴权中间件
 * 从 Authorization header 提取 token 并验证
 * 验证成功 → 将 payload 挂到 req.user
 * 验证失败 → 返回 401
 */

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

function auth(req, res, next) {
  // 读取 Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }

  // 格式: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: '认证格式错误' });
  }

  const token = parts[1];

  // 验证 token
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: '令牌无效或已过期' });
  }
}

module.exports = auth;
