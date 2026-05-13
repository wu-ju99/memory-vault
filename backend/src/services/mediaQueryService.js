const { pool } = require('../config/db');
const {
  buildContainsPattern,
  LIKE_ESCAPE_SQL,
  normalizeOptionalEnum,
  normalizeOptionalId,
  normalizeOptionalYear,
  normalizeTextFilter,
} = require('../utils/queryFilters');

function normalizeMediaFilters(rawFilters = {}) {
  return {
    albumId: normalizeOptionalId(rawFilters.album_id, '相册 ID'),
    keyword: normalizeTextFilter(rawFilters.q),
    type: normalizeOptionalEnum(rawFilters.type, ['image', 'video'], '媒体类型'),
    userId: normalizeOptionalId(rawFilters.user_id, '上传者 ID'),
    year: normalizeOptionalYear(rawFilters.year, '媒体年份'),
  };
}

async function listMedia(rawFilters = {}) {
  const filters = normalizeMediaFilters(rawFilters);
  let sql = `
    SELECT
      m.id,
      m.user_id,
      m.album_id,
      m.url,
      m.type,
      m.size,
      m.description,
      m.event_time,
      m.created_at,
      a.title AS album_title,
      u.username,
      u.nickname,
      u.avatar,
      u.role
    FROM media m
    LEFT JOIN albums a ON m.album_id = a.id
    JOIN users u ON m.user_id = u.id`;
  const where = [];
  const params = [];

  if (filters.albumId) {
    where.push('m.album_id = ?');
    params.push(filters.albumId);
  }

  if (filters.keyword) {
    where.push(`COALESCE(m.description, '') LIKE ?${LIKE_ESCAPE_SQL}`);
    params.push(buildContainsPattern(filters.keyword));
  }

  if (filters.type) {
    where.push('m.type = ?');
    params.push(filters.type);
  }

  if (filters.userId) {
    where.push('m.user_id = ?');
    params.push(filters.userId);
  }

  if (filters.year) {
    where.push('COALESCE(YEAR(m.event_time), YEAR(m.created_at)) = ?');
    params.push(filters.year);
  }

  if (where.length > 0) {
    sql += ` WHERE ${where.join(' AND ')}`;
  }

  sql += ' ORDER BY m.created_at DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = {
  listMedia,
};
