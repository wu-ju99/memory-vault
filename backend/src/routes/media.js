/**
 * 媒体路由（受 JWT 保护）
 * POST /api/media/upload → 上传图片
 */

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const mediaController = require('../controllers/mediaController');

// 上传（单文件或多文件，字段名 files，最多 10 个）
router.post('/media/upload', auth, (req, res, next) => {
  upload.array('files', 10)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: '单个文件大小不能超过 500MB' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ message: '一次最多上传 10 个文件' });
      }
      if (err.name === 'MulterError') {
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message });
    }
    mediaController.upload(req, res, next);
  });
});

// 获取图片列表
router.get('/media', auth, mediaController.list);

// 更新媒体描述
router.put('/media/:id', auth, mediaController.update);

// 删除媒体
router.delete('/media/:id', auth, mediaController.remove);

module.exports = router;
