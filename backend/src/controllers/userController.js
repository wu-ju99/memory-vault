/**
 * 用户控制器 — 处理用户相关 HTTP 请求
 */

const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const userService = require('../services/userService');

const AVATARS_DIR = path.resolve(__dirname, '../../uploads/avatars');
const AVATAR_MAX = 2 * 1024 * 1024; // 2MB

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AVATARS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar_${uuidv4()}${ext}`);
  },
});

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

function avatarFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (IMAGE_EXTS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('头像仅支持 jpg、png、webp 格式'));
  }
}

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFilter,
  limits: { fileSize: AVATAR_MAX },
}).single('avatar');

/**
 * GET /api/user/profile
 */
async function getProfile(req, res, next) {
  try {
    const user = await userService.getProfile(req.user.id);
    res.json({ user });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
}

/**
 * PUT /api/user/update-profile
 * 支持 multipart/form-data：nickname, oldPassword, newPassword, confirmPassword, avatar(file)
 */
async function updateProfile(req, res, next) {
  avatarUpload(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: '头像文件不能超过 2MB' });
      }
      if (err.name === 'MulterError') {
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message });
    }

    try {
      const { nickname, oldPassword, newPassword, confirmPassword } = req.body;
      const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;

      const user = await userService.updateProfile(req.user.id, {
        nickname: nickname !== undefined && nickname !== '' ? nickname.trim() : undefined,
        avatar,
        oldPassword: oldPassword || undefined,
        newPassword: newPassword || undefined,
        confirmPassword: confirmPassword || undefined,
      });

      res.json({ user });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      }
      next(error);
    }
  });
}

module.exports = { getProfile, updateProfile };
