const { pool } = require('../config/db');
const {
  buildContainsPattern,
  LIKE_ESCAPE_SQL,
  normalizeOptionalId,
  normalizeOptionalYear,
  normalizeTextFilter,
} = require('../utils/queryFilters');

function normalizeAdminAlbumFilters(rawFilters = {}) {
  return {
    keyword: normalizeTextFilter(rawFilters.q),
    year: normalizeOptionalYear(rawFilters.year, '相册年份'),
    userId: normalizeOptionalId(rawFilters.user_id, '创建者 ID'),
  };
}

async function listAlbums(rawFilters = {}) {
  const filters = normalizeAdminAlbumFilters(rawFilters);
  let sql = `
    SELECT
      a.id,
      a.user_id,
      a.title,
      a.album_year,
      a.cover_url,
      a.created_at,
      u.username,
      u.nickname,
      u.avatar,
      u.role
    FROM albums a
    JOIN users u ON a.user_id = u.id`;
  const where = [];
  const params = [];

  if (filters.keyword) {
    const keywordPattern = buildContainsPattern(filters.keyword);
    where.push(`(
      a.title LIKE ?${LIKE_ESCAPE_SQL}
      OR u.username LIKE ?${LIKE_ESCAPE_SQL}
      OR COALESCE(u.nickname, '') LIKE ?${LIKE_ESCAPE_SQL}
    )`);
    params.push(keywordPattern, keywordPattern, keywordPattern);
  }

  if (filters.year) {
    where.push('COALESCE(a.album_year, YEAR(a.created_at)) = ?');
    params.push(filters.year);
  }

  if (filters.userId) {
    where.push('a.user_id = ?');
    params.push(filters.userId);
  }

  if (where.length > 0) {
    sql += ` WHERE ${where.join(' AND ')}`;
  }

  sql += ' ORDER BY COALESCE(a.album_year, YEAR(a.created_at)) DESC, a.created_at DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = {
  listAlbums,
};
