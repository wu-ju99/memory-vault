/**
 * 媒体控制器 — 处理上传与列表请求
 * POST /api/media/upload（需 JWT）
 * GET  /api/media（需 JWT）
 */

const mediaService = require('../services/mediaService');
const { IMAGE_MAX, VIDEO_MAX } = require('../middlewares/upload');

/**
 * 根据 mimetype 判断媒体类型
 */
function detectType(mimetype) {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return null;
}

/**
 * 上传（单文件或多文件）
 */
async function upload(req, res, next) {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: '请选择要上传的文件' });
    }

    const description = req.body.description || '';
    const albumId = req.body.album_id ? parseInt(req.body.album_id, 10) || null : null;
    const results = [];

    for (const file of files) {
      const type = detectType(file.mimetype);
      if (!type) continue;

      // 分类型校验
      if (type === 'image' && file.size > IMAGE_MAX) continue;
      if (type === 'video' && file.size > VIDEO_MAX) continue;

      const result = await mediaService.createMedia(
        req.user.id,
        file.filename,
        type,
        file.size,
        description,
        albumId
      );
      results.push(result);
    }

    res.status(201).json({ files: results, count: results.length });
  } catch (error) {
    if (error.message && error.message.includes('仅允许上传')) {
      return res.status(400).json({ message: error.message });
    }
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
    const mediaId = parseInt(req.params.id, 10);
    const { description } = req.body;

    if (!description && description !== '') {
      return res.status(400).json({ message: 'description 字段不能为空' });
    }

    // 查询媒体记录，校验存在性
    const media = await mediaService.getById(mediaId);
    if (!media) {
      return res.status(404).json({ message: '媒体不存在' });
    }

    // 权限校验：仅上传者本人或管理员可修改
    if (media.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权修改该媒体' });
    }

    const updated = await mediaService.updateDescription(mediaId, description);
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
    const mediaId = parseInt(req.params.id, 10);

    const media = await mediaService.getById(mediaId);
    if (!media) {
      return res.status(404).json({ message: '媒体不存在' });
    }

    if (media.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权删除该媒体' });
    }

    await mediaService.deleteById(mediaId);
    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
}

module.exports = { upload, list, update, remove };
