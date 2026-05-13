const { pool } = require('../config/db');
const httpError = require('../utils/httpError');
const fileStorageService = require('./fileStorageService');

function normalizeRole(role) {
  if (!role) return undefined;
  if (!['user', 'admin'].includes(role)) {
    throw httpError(400, '角色只能是 user 或 admin');
  }
  return role;
}

async function getAdminCount() {
  const [rows] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE role = ?', ['admin']);
  return rows[0].count;
}

async function getUserById(userId) {
  const [rows] = await pool.query(
    'SELECT id, username, nickname, avatar, role, created_at FROM users WHERE id = ?',
    [userId]
  );
  return rows[0] || null;
}

async function updateUser(userId, fields) {
  const user = await getUserById(userId);
  if (!user) {
    throw httpError(404, '用户不存在');
  }

  const username = fields.username?.trim();
  const nickname = fields.nickname !== undefined ? fields.nickname.trim() : undefined;
  const role = normalizeRole(fields.role);
  const sets = [];
  const params = [];

  if (username) {
    sets.push('username = ?');
    params.push(username);
  }
  if (nickname !== undefined) {
    sets.push('nickname = ?');
    params.push(nickname || null);
  }
  if (role) {
    if (user.role === 'admin' && role !== 'admin' && await getAdminCount() <= 1) {
      throw httpError(400, '不能移除最后一个管理员');
    }
    sets.push('role = ?');
    params.push(role);
  }

  if (sets.length === 0) {
    return user;
  }

  params.push(userId);
  try {
    await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw httpError(400, '用户名已存在');
    }
    throw error;
  }

  return getUserById(userId);
}

async function deleteUser(userId, adminUserId) {
  if (userId === adminUserId) {
    throw httpError(400, '管理员不能删除自己');
  }

  const user = await getUserById(userId);
  if (!user) {
    throw httpError(404, '用户不存在');
  }

  if (user.role === 'admin' && await getAdminCount() <= 1) {
    throw httpError(400, '不能删除最后一个管理员');
  }

  const [mediaRows] = await pool.query('SELECT url FROM media WHERE user_id = ?', [userId]);
  const [albumRows] = await pool.query(
    'SELECT cover_url FROM albums WHERE user_id = ? AND cover_url IS NOT NULL',
    [userId]
  );
  const urls = new Set([
    ...mediaRows.map((row) => row.url),
    ...albumRows.map((row) => row.cover_url),
  ]);

  for (const url of urls) {
    await fileStorageService.removeUploadByUrl(url);
  }

  await pool.query('DELETE FROM users WHERE id = ?', [userId]);
}

module.exports = {
  updateUser,
  deleteUser,
};
