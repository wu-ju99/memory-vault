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
    'SELECT id, title, created_at FROM albums WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
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
