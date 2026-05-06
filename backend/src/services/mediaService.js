/**
 * 媒体服务 — 处理文件上传与数据库记录
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

/**
 * 保存上传记录到数据库
 * @param {number} userId
 * @param {string} filename
 * @param {string} type - 'image' | 'video'
 * @param {number} size
 * @returns {object} { id, url, type, size }
 */
async function createMedia(userId, filename, type, size, description, albumId) {
  const url = `/uploads/${filename}`;
  const desc = description || '';

  const [result] = await pool.query(
    'INSERT INTO media (user_id, album_id, url, type, size, description) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, albumId || null, url, type, size, desc]
  );

  return {
    id: result.insertId,
    url,
    type,
    size,
    description: desc,
    album_id: albumId || null,
  };
}

/**
 * 获取当前用户的媒体列表，按时间倒序
 * @param {number} userId
 * @returns {array}
 */
async function getList(userId, albumId) {
  let sql = 'SELECT m.id, m.album_id, m.url, m.type, m.size, m.description, m.created_at, a.title AS album_title FROM media m LEFT JOIN albums a ON m.album_id = a.id WHERE m.user_id = ?';
  const params = [userId];

  if (albumId) {
    sql += ' AND m.album_id = ?';
    params.push(albumId);
  }

  sql += ' ORDER BY m.created_at DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * 根据 ID 查询媒体（含上传者信息，用于权限校验）
 */
async function getById(id) {
  const [rows] = await pool.query(
    'SELECT id, user_id, album_id, url, type, size, description, created_at FROM media WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

/**
 * 更新媒体描述（权限校验在 controller）
 */
async function updateDescription(id, description) {
  await pool.query(
    'UPDATE media SET description = ? WHERE id = ?',
    [description, id]
  );
  return getById(id);
}

/**
 * 删除媒体（数据库记录 + 磁盘文件）
 */
async function deleteById(id) {
  const media = await getById(id);
  if (!media) return null;

  // 删除磁盘文件
  const filename = path.basename(media.url);
  const filePath = path.join(UPLOADS_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // 文件不存在时忽略
  }

  // 删除数据库记录
  await pool.query('DELETE FROM media WHERE id = ?', [id]);

  return media;
}

module.exports = { createMedia, getList, getById, updateDescription, deleteById };
