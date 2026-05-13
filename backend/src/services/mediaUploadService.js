const path = require('path');
const mediaService = require('./mediaService');
const fileStorageService = require('./fileStorageService');
const { IMAGE_MAX, VIDEO_MAX } = require('../middlewares/upload');
const httpError = require('../utils/httpError');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const VIDEO_EXTS = new Set(['.mp4', '.mov', '.webm']);

function detectType(file = {}) {
  const mimetype = file.mimetype || '';
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';

  const ext = path.extname(file.originalname || file.filename || '').toLowerCase();
  if (IMAGE_EXTS.has(ext)) return 'image';
  if (VIDEO_EXTS.has(ext)) return 'video';
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
  let skippedCount = 0;

  for (const file of files) {
    const type = detectType(file);

    if (!type || !isWithinTypeLimit(type, file.size)) {
      await fileStorageService.removeUploadedFile(file);
      skippedCount += 1;
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

  if (results.length === 0) {
    throw httpError(400, skippedCount > 0
      ? '所选文件未通过格式或大小校验，请重新选择视频或图片后再试'
      : '请选择要上传的文件');
  }

  return results;
}

module.exports = {
  createMediaFromFiles,
};
