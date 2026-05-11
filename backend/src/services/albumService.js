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
    'SELECT a.id, a.user_id, a.title, a.cover_url, a.created_at, u.username, u.role FROM albums a JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC'
  );
  return rows;
}

async function getById(id, userId) {
  const params = [id];
  let sql = 'SELECT id, user_id, title, cover_url, created_at FROM albums WHERE id = ?';
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

async function getAlbumImageByUrl(albumId, coverUrl) {
  const [rows] = await pool.query(
    'SELECT id, url FROM media WHERE album_id = ? AND url = ? AND type = ? LIMIT 1',
    [albumId, coverUrl, 'image']
  );
  return rows[0] || null;
}

async function updateCover(albumId, coverUrl) {
  await pool.query('UPDATE albums SET cover_url = ? WHERE id = ?', [coverUrl, albumId]);
}

module.exports = { create, getList, getById, getAlbumImageByUrl, updateCover };
