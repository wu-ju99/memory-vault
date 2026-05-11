const fs = require('fs');
const path = require('path');
const albumService = require('../services/albumService');

const IMAGE_MAX = 10 * 1024 * 1024;

function removeUploadedFile(file) {
  if (!file?.path) return;
  try {
    fs.unlinkSync(path.resolve(file.path));
  } catch {}
}

async function create(req, res, next) {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: '相册名称不能为空' });
    }
    const album = await albumService.create(req.user.id, title.trim());
    res.status(201).json(album);
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const rows = await albumService.getList(req.user.id);
    res.json({ albums: rows });
  } catch (error) {
    next(error);
  }
}

async function setCover(req, res, next) {
  try {
    const albumId = parseInt(req.params.id, 10);
    if (!Number.isInteger(albumId)) {
      removeUploadedFile(req.file);
      return res.status(400).json({ message: '相册 ID 无效' });
    }

    const album = await albumService.getById(albumId);
    if (!album) {
      removeUploadedFile(req.file);
      return res.status(404).json({ message: '相册不存在' });
    }

    let coverUrl = '';
    if (req.file) {
      if (!req.file.mimetype.startsWith('image/') || req.file.size > IMAGE_MAX) {
        removeUploadedFile(req.file);
        return res.status(400).json({ message: '封面只能上传 10MB 以内的图片' });
      }
      coverUrl = `/uploads/${req.file.filename}`;
    } else {
      coverUrl = (req.body.cover_url || '').trim();
      if (!coverUrl) {
        return res.status(400).json({ message: '封面地址不能为空' });
      }

      const media = await albumService.getAlbumImageByUrl(albumId, coverUrl);
      if (!media) {
        return res.status(400).json({ message: '只能选择本相册内的照片作为封面' });
      }
    }

    await albumService.updateCover(albumId, coverUrl);
    res.json({ message: '封面已更新', cover_url: coverUrl });
  } catch (error) {
    removeUploadedFile(req.file);
    next(error);
  }
}

module.exports = { create, list, setCover };
