/**
 * 媒体服务 — 处理文件上传与数据库记录
 */

const { pool } = require('../config/db');

async function createMedia(userId, filename, type, size, description, albumId, eventTime) {
  const url = `/uploads/${filename}`;
  const desc = description || '';

  const [result] = await pool.query(
    'INSERT INTO media (user_id, album_id, url, type, size, description, event_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userId, albumId || null, url, type, size, desc, eventTime || null]
  );

  return {
    id: result.insertId,
    url,
    type,
    size,
    description: desc,
    album_id: albumId || null,
    event_time: eventTime || null,
  };
}

async function getById(id) {
  const [rows] = await pool.query(
    'SELECT id, user_id, album_id, url, type, size, description, event_time, created_at FROM media WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function updateDescription(id, description) {
  await pool.query(
    'UPDATE media SET description = ? WHERE id = ?',
    [description, id]
  );
  return getById(id);
}

async function deleteById(id) {
  await pool.query('DELETE FROM media WHERE id = ?', [id]);
}

module.exports = { createMedia, getById, updateDescription, deleteById };
