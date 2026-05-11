const { pool } = require('../config/db');
const { IMAGE_MAX } = require('../middlewares/upload');
const albumService = require('./albumService');
const fileStorageService = require('./fileStorageService');
const httpError = require('../utils/httpError');

function assertCoverFile(file) {
  if (!file) {
    throw httpError(400, '封面文件不能为空');
  }
  if (!file.mimetype.startsWith('image/') || file.size > IMAGE_MAX) {
    throw httpError(400, '封面只能上传 10MB 以内的图片');
  }
}

async function requireAlbum(albumId) {
  const album = await albumService.getById(albumId);
  if (!album) {
    throw httpError(404, '相册不存在');
  }
  return album;
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

async function setCoverFromUpload(albumId, file) {
  try {
    assertCoverFile(file);
    await requireAlbum(albumId);
    const coverUrl = fileStorageService.toUploadUrl(file.filename);
    await updateCover(albumId, coverUrl);
    return coverUrl;
  } catch (error) {
    await fileStorageService.removeUploadedFile(file);
    throw error;
  }
}

async function setCoverFromAlbumMedia(albumId, coverUrl) {
  const normalizedUrl = (coverUrl || '').trim();
  if (!normalizedUrl) {
    throw httpError(400, '封面地址不能为空');
  }

  await requireAlbum(albumId);
  const media = await getAlbumImageByUrl(albumId, normalizedUrl);
  if (!media) {
    throw httpError(400, '只能选择本相册内的照片作为封面');
  }

  await updateCover(albumId, normalizedUrl);
  return normalizedUrl;
}

async function clearCoverByUrl(coverUrl) {
  if (!coverUrl) return;
  await pool.query('UPDATE albums SET cover_url = NULL WHERE cover_url = ?', [coverUrl]);
}

module.exports = {
  setCoverFromUpload,
  setCoverFromAlbumMedia,
  clearCoverByUrl,
};
