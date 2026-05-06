/**
 * 评论服务 — 创建、查询、删除
 */

const { pool } = require('../config/db');

async function create(userId, mediaId, content) {
  const [result] = await pool.query(
    'INSERT INTO comments (user_id, media_id, content) VALUES (?, ?, ?)',
    [userId, mediaId, content]
  );
  return { id: result.insertId };
}

async function getByMedia(mediaId) {
  const [rows] = await pool.query(
    `SELECT c.id, c.media_id, c.content, c.created_at, c.user_id, u.username
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.media_id = ?
     ORDER BY c.created_at ASC`,
    [mediaId]
  );
  return rows;
}

async function deleteById(commentId) {
  await pool.query('DELETE FROM comments WHERE id = ?', [commentId]);
}

module.exports = { create, getByMedia, deleteById };
