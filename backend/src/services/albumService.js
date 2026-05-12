const { pool } = require('../config/db');

async function create(userId, title, albumYear) {
  const [result] = await pool.query(
    'INSERT INTO albums (user_id, title, album_year) VALUES (?, ?, ?)',
    [userId, title, albumYear]
  );
  return getDisplayById(result.insertId);
}

async function getList(userId) {
  const [rows] = await pool.query(
    'SELECT a.id, a.user_id, a.title, a.album_year, a.cover_url, a.created_at, u.username, u.nickname, u.role FROM albums a JOIN users u ON a.user_id = u.id ORDER BY COALESCE(a.album_year, YEAR(a.created_at)) DESC, a.created_at DESC'
  );
  return rows;
}

async function getById(id, userId) {
  const params = [id];
  let sql = 'SELECT id, user_id, title, album_year, cover_url, created_at FROM albums WHERE id = ?';
  if (userId) {
    sql += ' AND user_id = ?';
    params.push(userId);
  }

  const [rows] = await pool.query(
    sql,
    params
  );
  return rows[0] || null;
}

async function getDisplayById(id) {
  const [rows] = await pool.query(
    'SELECT a.id, a.user_id, a.title, a.album_year, a.cover_url, a.created_at, u.username, u.nickname, u.role FROM albums a JOIN users u ON a.user_id = u.id WHERE a.id = ?',
    [id]
  );
  return rows[0] || null;
}

async function updateTitle(albumId, title) {
  await pool.query('UPDATE albums SET title = ? WHERE id = ?', [title, albumId]);
  return getDisplayById(albumId);
}

async function deleteById(albumId) {
  await pool.query('DELETE FROM albums WHERE id = ?', [albumId]);
}

module.exports = {
  create,
  getList,
  getById,
  getDisplayById,
  updateTitle,
  deleteById,
};
