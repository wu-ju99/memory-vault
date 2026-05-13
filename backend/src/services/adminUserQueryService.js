const { pool } = require('../config/db');
const {
  buildContainsPattern,
  LIKE_ESCAPE_SQL,
  normalizeOptionalEnum,
  normalizeTextFilter,
} = require('../utils/queryFilters');

function normalizeAdminUserFilters(rawFilters = {}) {
  return {
    keyword: normalizeTextFilter(rawFilters.q),
    role: normalizeOptionalEnum(rawFilters.role, ['user', 'admin'], '角色'),
  };
}

async function listUsers(rawFilters = {}) {
  const filters = normalizeAdminUserFilters(rawFilters);
  let sql = `
    SELECT
      u.id,
      u.username,
      u.nickname,
      u.avatar,
      u.role,
      u.created_at,
      COUNT(DISTINCT a.id) AS album_count,
      COUNT(DISTINCT m.id) AS media_count,
      COUNT(DISTINCT c.id) AS comment_count
    FROM users u
    LEFT JOIN albums a ON a.user_id = u.id
    LEFT JOIN media m ON m.user_id = u.id
    LEFT JOIN comments c ON c.user_id = u.id`;
  const where = [];
  const params = [];

  if (filters.keyword) {
    const keywordPattern = buildContainsPattern(filters.keyword);
    where.push(`(
      u.username LIKE ?${LIKE_ESCAPE_SQL}
      OR COALESCE(u.nickname, '') LIKE ?${LIKE_ESCAPE_SQL}
    )`);
    params.push(keywordPattern, keywordPattern);
  }

  if (filters.role) {
    where.push('u.role = ?');
    params.push(filters.role);
  }

  if (where.length > 0) {
    sql += ` WHERE ${where.join(' AND ')}`;
  }

  sql += ' GROUP BY u.id ORDER BY u.created_at DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = {
  listUsers,
};
