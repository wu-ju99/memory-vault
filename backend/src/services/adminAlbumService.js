const albumService = require('./albumService');
const albumCoverService = require('./albumCoverService');

async function deleteAlbum(albumId) {
  await albumService.deleteById(albumId);
}

async function setCoverFromUpload(albumId, file) {
  return albumCoverService.setCoverFromUpload(albumId, file);
}

async function setCoverFromAlbumMedia(albumId, coverUrl) {
  return albumCoverService.setCoverFromAlbumMedia(albumId, coverUrl);
}

module.exports = {
  deleteAlbum,
  setCoverFromUpload,
  setCoverFromAlbumMedia,
};
