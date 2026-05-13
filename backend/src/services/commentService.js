/**
 * 评论服务 — 创建、查询、删除（支持回复/树形结构）
 */

const { pool } = require('../config/db');

async function create(userId, mediaId, content, parentId) {
  const [result] = await pool.query(
    'INSERT INTO comments (user_id, media_id, content, parent_id) VALUES (?, ?, ?, ?)',
    [userId, mediaId, content, parentId || null]
  );
  return { id: result.insertId };
}

async function getByMedia(mediaId) {
  const [rows] = await pool.query(
    `SELECT c.id, c.media_id, c.parent_id, c.content, c.created_at, c.user_id, u.username, u.nickname, u.avatar, u.role
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.media_id = ?
     ORDER BY c.created_at ASC`,
    [mediaId]
  );
  return rows;
}

// 级联删除：删除评论及其所有回复
async function deleteById(commentId) {
  await pool.query('DELETE FROM comments WHERE id = ? OR parent_id = ?', [commentId, commentId]);
}

module.exports = { create, getByMedia, deleteById };
