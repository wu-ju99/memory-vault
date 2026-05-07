/**
 * 相册服务 — 创建、查询相册
 */

const { pool } = require('../config/db');

async function create(userId, title) {
  const [result] = await pool.query(
    'INSERT INTO albums (user_id, title) VALUES (?, ?)',
    [userId, title]
  );
  return { id: result.insertId, title };
}

async function getList(userId) {
  const [rows] = await pool.query(
    'SELECT a.id, a.user_id, a.title, a.created_at, u.username FROM albums a JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC'
  );
  return rows;
}

async function getById(id, userId) {
  const [rows] = await pool.query(
    'SELECT id, title, created_at FROM albums WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return rows[0] || null;
}

module.exports = { create, getList, getById };
