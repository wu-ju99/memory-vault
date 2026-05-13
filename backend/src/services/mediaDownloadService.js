const fs = require('fs/promises');
const path = require('path');
const mediaService = require('./mediaService');
const fileStorageService = require('./fileStorageService');
const httpError = require('../utils/httpError');

function sanitizeNamePart(value, fallback) {
  const text = String(value || fallback || '')
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return text || fallback;
}

function formatDatePart(iso) {
  if (!iso) return 'undated';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'undated';
  return date.toISOString().slice(0, 10);
}

async function requireMedia(mediaId) {
  const media = await mediaService.getById(mediaId);
  if (!media) {
    throw httpError(404, '媒体不存在');
  }
  return media;
}

async function buildDownloadPayload(mediaId) {
  const media = await requireMedia(mediaId);
  const filename = path.basename(media.url || '');
  const absolutePath = path.join(fileStorageService.UPLOADS_DIR, filename);

  try {
    await fs.access(absolutePath);
  } catch {
    throw httpError(404, '源文件不存在');
  }

  const ext = path.extname(filename).toLowerCase();
  const kind = media.type === 'video' ? 'video' : 'photo';
  const dated = formatDatePart(media.event_time || media.created_at);
  const suggestedName = `memory-vault-${kind}-${dated}-${media.id}${ext}`;

  return {
    path: absolutePath,
    filename: sanitizeNamePart(suggestedName, `memory-vault-${media.id}${ext}`),
    media,
  };
}

module.exports = {
  buildDownloadPayload,
};
