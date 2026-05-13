const albumService = require('./albumService');
const albumCoverService = require('./albumCoverService');
const httpError = require('../utils/httpError');

function normalizeBatchIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw httpError(400, '请至少选择一个相册');
  }

  const normalized = Array.from(
    new Set(
      ids.map((id) => parseInt(id, 10)).filter((id) => Number.isInteger(id) && id > 0)
    )
  );

  if (normalized.length === 0) {
    throw httpError(400, '相册 ID 无效');
  }

  return normalized;
}

async function deleteAlbum(albumId) {
  await albumService.deleteById(albumId);
}

async function deleteAlbums(albumIds) {
  const ids = normalizeBatchIds(albumIds);

  for (const albumId of ids) {
    await deleteAlbum(albumId);
  }

  return {
    count: ids.length,
    ids,
  };
}

async function setCoverFromUpload(albumId, file) {
  return albumCoverService.setCoverFromUpload(albumId, file);
}

async function setCoverFromAlbumMedia(albumId, coverUrl) {
  return albumCoverService.setCoverFromAlbumMedia(albumId, coverUrl);
}

module.exports = {
  deleteAlbum,
  deleteAlbums,
  setCoverFromUpload,
  setCoverFromAlbumMedia,
};
