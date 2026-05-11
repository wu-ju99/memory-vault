const mediaService = require('./mediaService');
const albumCoverService = require('./albumCoverService');
const fileStorageService = require('./fileStorageService');
const httpError = require('../utils/httpError');

function assertMediaOwnerOrAdmin(media, user) {
  if (media.user_id !== user.id && user.role !== 'admin') {
    return false;
  }
  return true;
}

async function requireMedia(mediaId) {
  const media = await mediaService.getById(mediaId);
  if (!media) {
    throw httpError(404, '媒体不存在');
  }
  return media;
}

async function updateDescription(mediaId, user, description) {
  if (!description && description !== '') {
    throw httpError(400, 'description 字段不能为空');
  }

  const media = await requireMedia(mediaId);
  if (!assertMediaOwnerOrAdmin(media, user)) {
    throw httpError(403, '无权修改该媒体');
  }

  return mediaService.updateDescription(mediaId, description);
}

async function deleteMedia(mediaId, user) {
  const media = await requireMedia(mediaId);
  if (!assertMediaOwnerOrAdmin(media, user)) {
    throw httpError(403, '无权删除该媒体');
  }

  await fileStorageService.removeUploadByUrl(media.url);
  await mediaService.deleteById(mediaId);
  await albumCoverService.clearCoverByUrl(media.url);

  return media;
}

module.exports = {
  updateDescription,
  deleteMedia,
};
