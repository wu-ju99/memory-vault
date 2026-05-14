/**
 * JWT 配置
 * 密钥和过期时间
 */

const DEFAULT_DEV_SECRET = 'memory-vault-dev-secret-key';
const secret = process.env.JWT_SECRET || DEFAULT_DEV_SECRET;

if (process.env.NODE_ENV === 'production' && secret === DEFAULT_DEV_SECRET) {
  throw new Error('生产环境必须通过 JWT_SECRET 环境变量提供安全密钥');
}

module.exports = {
  secret,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
