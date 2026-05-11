/**
 * 媒体控制器 — 处理上传与列表请求
 * POST /api/media/upload（需 JWT）
 * GET  /api/media（需 JWT）
 */

const mediaService = require('../services/mediaService');
const mediaUploadService = require('../services/mediaUploadService');
const mediaManagementService = require('../services/mediaManagementService');
const parseId = require('../utils/parseId');

/**
 * 上传（单文件或多文件）
 */
async function upload(req, res, next) {
  try {
    const results = await mediaUploadService.createMediaFromFiles(req.user.id, req.files, req.body);

    res.status(201).json({ files: results, count: results.length });
  } catch (error) {
    next(error);
  }
}

/**
 * 获取列表
 */
async function list(req, res, next) {
  try {
    const albumId = req.query.album_id || null;
    const rows = await mediaService.getList(req.user.id, albumId);
    res.json({ media: rows });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/media/:id
 * 更新媒体描述（仅上传者或管理员可操作）
 */
async function update(req, res, next) {
  try {
    const mediaId = parseId(req.params.id, '媒体 ID');
    const updated = await mediaManagementService.updateDescription(mediaId, req.user, req.body.description);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/media/:id
 * 删除媒体（仅上传者或管理员可操作）
 */
async function remove(req, res, next) {
  try {
    const mediaId = parseId(req.params.id, '媒体 ID');
    await mediaManagementService.deleteMedia(mediaId, req.user);
    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
}

module.exports = { upload, list, update, remove };
