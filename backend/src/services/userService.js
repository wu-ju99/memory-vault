/**
 * 用户服务 — 用户信息查询与更新
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const SALT_ROUNDS = 10;

async function getProfile(userId) {
  const [rows] = await pool.query(
    'SELECT id, username, nickname, avatar, role, created_at FROM users WHERE id = ?',
    [userId]
  );
  if (rows.length === 0) {
    throw Object.assign(new Error('用户不存在'), { status: 404 });
  }
  return rows[0];
}

/**
 * 更新用户资料
 * @param {number} userId
 * @param {object} fields - { nickname?, avatar?, oldPassword?, newPassword?, confirmPassword? }
 * @returns {object} 更新后的用户信息
 */
async function updateProfile(userId, fields) {
  const { nickname, avatar, oldPassword, newPassword, confirmPassword } = fields;

  // 密码修改验证
  if (newPassword) {
    if (!oldPassword) {
      throw Object.assign(new Error('请输入旧密码'), { status: 400 });
    }
    if (newPassword.length < 6) {
      throw Object.assign(new Error('新密码长度不能少于 6 位'), { status: 400 });
    }
    if (newPassword !== confirmPassword) {
      throw Object.assign(new Error('两次新密码输入不一致'), { status: 400 });
    }

    // 验证旧密码
    const [rows] = await pool.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );
    const isMatch = await bcrypt.compare(oldPassword, rows[0].password_hash);
    if (!isMatch) {
      throw Object.assign(new Error('旧密码不正确'), { status: 400 });
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    if (nickname !== undefined || avatar !== undefined) {
      await pool.query(
        'UPDATE users SET password_hash = ?, nickname = COALESCE(?, nickname), avatar = COALESCE(?, avatar) WHERE id = ?',
        [newHash, nickname !== undefined ? nickname : null, avatar !== undefined ? avatar : null, userId]
      );
    } else {
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);
    }
  } else {
    // 仅更新昵称/头像
    const sets = [];
    const params = [];
    if (nickname !== undefined) { sets.push('nickname = ?'); params.push(nickname); }
    if (avatar !== undefined) { sets.push('avatar = ?'); params.push(avatar); }
    if (sets.length > 0) {
      params.push(userId);
      await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params);
    }
  }

  return getProfile(userId);
}

module.exports = { getProfile, updateProfile };
