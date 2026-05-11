/**
 * 媒体路由（受 JWT 保护）
 * POST /api/media/upload → 上传图片
 */

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { withUpload } = require('../middlewares/uploadErrors');
const mediaController = require('../controllers/mediaController');

// 上传（单文件或多文件，字段名 files，最多 10 个）
router.post(
  '/media/upload',
  auth,
  withUpload(upload.array('files', 10), {
    fileSizeMessage: '单个文件大小不能超过 500MB',
    fileCountMessage: '一次最多上传 10 个文件',
  }),
  mediaController.upload
);

// 获取图片列表
router.get('/media', auth, mediaController.list);

// 更新媒体描述
router.put('/media/:id', auth, mediaController.update);

// 删除媒体
router.delete('/media/:id', auth, mediaController.remove);

module.exports = router;
