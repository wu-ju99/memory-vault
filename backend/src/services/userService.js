/**
 * 用户服务 — 用户信息查询
 */

const { pool } = require('../config/db');

/**
 * 获取当前用户信息
 * @param {number} userId
 * @returns {object} { id, username, role, created_at }
 */
async function getProfile(userId) {
  const [rows] = await pool.query(
    'SELECT id, username, role, created_at FROM users WHERE id = ?',
    [userId]
  );

  if (rows.length === 0) {
    throw Object.assign(new Error('用户不存在'), { status: 404 });
  }

  return rows[0];
}

module.exports = { getProfile };
