const mediaService = require('./mediaService');
const fileStorageService = require('./fileStorageService');
const { IMAGE_MAX, VIDEO_MAX } = require('../middlewares/upload');
const httpError = require('../utils/httpError');

function detectType(mimetype) {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return null;
}

function isWithinTypeLimit(type, size) {
  if (type === 'image') return size <= IMAGE_MAX;
  if (type === 'video') return size <= VIDEO_MAX;
  return false;
}

async function createMediaFromFiles(userId, files, payload = {}) {
  if (!files || files.length === 0) {
    throw httpError(400, '请选择要上传的文件');
  }

  const description = payload.description || '';
  const albumId = payload.album_id ? parseInt(payload.album_id, 10) || null : null;
  const eventTime = payload.event_time || null;
  const results = [];

  for (const file of files) {
    const type = detectType(file.mimetype);

    if (!type || !isWithinTypeLimit(type, file.size)) {
      await fileStorageService.removeUploadedFile(file);
      continue;
    }

    const result = await mediaService.createMedia(
      userId,
      file.filename,
      type,
      file.size,
      description,
      albumId,
      eventTime
    );
    results.push(result);
  }

  return results;
}

module.exports = {
  createMediaFromFiles,
};
