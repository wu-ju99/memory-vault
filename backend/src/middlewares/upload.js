/**
 * 文件上传中间件
 * 图片: jpg / png / webp，最大 10MB
 * 视频: mp4 / mov / webm，最大 500MB
 * 统一保存到 /uploads，UUID 文件名
 */

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

// 分类型大小限制
const IMAGE_MAX = 10 * 1024 * 1024;   // 10MB
const VIDEO_MAX = 500 * 1024 * 1024;  // 500MB

// 允许的扩展名
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const VIDEO_EXTS = ['.mp4', '.mov', '.webm'];

// 文件存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

// 文件过滤：图片 + 视频
function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (IMAGE_EXTS.includes(ext) || VIDEO_EXTS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('仅允许上传 jpg、png、webp（图片）或 mp4、mov、webm（视频）'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: Math.max(IMAGE_MAX, VIDEO_MAX) }, // 取较大值，分类型校验在 controller
});

// 供上传服务读取分类型大小限制
upload.IMAGE_MAX = IMAGE_MAX;
upload.VIDEO_MAX = VIDEO_MAX;

module.exports = upload;
