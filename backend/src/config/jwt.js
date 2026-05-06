/**
 * JWT 配置
 * 密钥和过期时间
 */

module.exports = {
  secret: process.env.JWT_SECRET || 'memory-vault-dev-secret-key',
  expiresIn: '7d',
};
