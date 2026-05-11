/**
 * 媒体服务 — 处理文件上传与数据库记录
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

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

async function getList(userId, albumId) {
  let sql = 'SELECT m.id, m.user_id, m.album_id, m.url, m.type, m.size, m.description, m.event_time, m.created_at, a.title AS album_title, u.username, u.role FROM media m LEFT JOIN albums a ON m.album_id = a.id JOIN users u ON m.user_id = u.id';
  const params = [];

  if (albumId) {
    sql += ' WHERE m.album_id = ?';
    params.push(albumId);
  }

  sql += ' ORDER BY m.created_at DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
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
  const media = await getById(id);
  if (!media) return null;

  const filename = path.basename(media.url);
  const filePath = path.join(UPLOADS_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {}

  await pool.query('DELETE FROM media WHERE id = ?', [id]);
  await pool.query('UPDATE albums SET cover_url = NULL WHERE cover_url = ?', [media.url]);

  return media;
}

module.exports = { createMedia, getList, getById, updateDescription, deleteById };
