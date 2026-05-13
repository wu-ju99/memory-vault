const mediaManagementService = require('./mediaManagementService');
const httpError = require('../utils/httpError');

function normalizeBatchIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw httpError(400, '请至少选择一个媒体');
  }

  const normalized = Array.from(
    new Set(
      ids.map((id) => parseInt(id, 10)).filter((id) => Number.isInteger(id) && id > 0)
    )
  );

  if (normalized.length === 0) {
    throw httpError(400, '媒体 ID 无效');
  }

  return normalized;
}

async function deleteMedia(mediaId, adminUser) {
  return mediaManagementService.deleteMedia(mediaId, adminUser);
}

async function deleteMediaBatch(mediaIds, adminUser) {
  const ids = normalizeBatchIds(mediaIds);

  for (const mediaId of ids) {
    await deleteMedia(mediaId, adminUser);
  }

  return {
    count: ids.length,
    ids,
  };
}

module.exports = {
  deleteMedia,
  deleteMediaBatch,
};
