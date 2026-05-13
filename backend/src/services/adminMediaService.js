const { pool } = require('../config/db');
const mediaManagementService = require('./mediaManagementService');

async function listMedia(filters = {}) {
  let sql = `SELECT
      m.id,
      m.user_id,
      m.album_id,
      m.url,
      m.type,
      m.size,
      m.description,
      m.event_time,
      m.created_at,
      u.username,
      u.nickname,
      u.avatar,
      u.role,
      a.title AS album_title,
      a.album_year
    FROM media m
    JOIN users u ON u.id = m.user_id
    LEFT JOIN albums a ON a.id = m.album_id`;
  const where = [];
  const params = [];

  if (filters.user_id) {
    where.push('m.user_id = ?');
    params.push(filters.user_id);
  }
  if (filters.album_id) {
    where.push('m.album_id = ?');
    params.push(filters.album_id);
  }
  if (filters.type) {
    where.push('m.type = ?');
    params.push(filters.type);
  }

  if (where.length > 0) {
    sql += ` WHERE ${where.join(' AND ')}`;
  }

  sql += ' ORDER BY m.created_at DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function deleteMedia(mediaId, adminUser) {
  return mediaManagementService.deleteMedia(mediaId, adminUser);
}

module.exports = {
  listMedia,
  deleteMedia,
};
