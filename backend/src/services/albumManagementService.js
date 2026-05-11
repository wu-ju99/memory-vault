const albumService = require('./albumService');
const httpError = require('../utils/httpError');

function getCurrentYear() {
  return new Date().getFullYear();
}

function normalizeAlbumYear(rawYear) {
  const fallbackYear = getCurrentYear();
  if (rawYear === undefined || rawYear === null || rawYear === '') {
    return fallbackYear;
  }

  const albumYear = Number(rawYear);
  const maxYear = fallbackYear + 1;
  if (!Number.isInteger(albumYear) || albumYear < 1900 || albumYear > maxYear) {
    throw httpError(400, `相册年份必须在 1900 到 ${maxYear} 之间`);
  }

  return albumYear;
}

async function requireAlbum(albumId) {
  const album = await albumService.getById(albumId);
  if (!album) {
    throw httpError(404, '相册不存在');
  }
  return album;
}

function assertAlbumOwner(album, userId, actionLabel) {
  if (album.user_id !== userId) {
    throw httpError(403, `只有相册创建者可以${actionLabel}`);
  }
}

async function createAlbum(userId, rawTitle, rawYear) {
  const title = (rawTitle || '').trim();
  if (!title) {
    throw httpError(400, '相册名称不能为空');
  }
  const albumYear = normalizeAlbumYear(rawYear);
  return albumService.create(userId, title, albumYear);
}

async function renameAlbum(albumId, userId, rawTitle) {
  const title = (rawTitle || '').trim();
  if (!title) {
    throw httpError(400, '相册名称不能为空');
  }

  const album = await requireAlbum(albumId);
  assertAlbumOwner(album, userId, '修改名称');

  return albumService.updateTitle(albumId, title);
}

async function deleteAlbum(albumId, userId) {
  const album = await requireAlbum(albumId);
  assertAlbumOwner(album, userId, '删除相册');
  await albumService.deleteById(albumId);
}

module.exports = {
  createAlbum,
  renameAlbum,
  deleteAlbum,
};
