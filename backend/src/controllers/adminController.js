const adminUserService = require('../services/adminUserService');
const adminMediaService = require('../services/adminMediaService');
const adminAlbumService = require('../services/adminAlbumService');
const adminUserQueryService = require('../services/adminUserQueryService');
const adminMediaQueryService = require('../services/adminMediaQueryService');
const adminAlbumQueryService = require('../services/adminAlbumQueryService');
const parseId = require('../utils/parseId');

async function listUsers(req, res, next) {
  try {
    const users = await adminUserQueryService.listUsers(req.query);
    res.json({ users });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const userId = parseId(req.params.id, '用户 ID');
    const user = await adminUserService.updateUser(userId, req.body);
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const userId = parseId(req.params.id, '用户 ID');
    await adminUserService.deleteUser(userId, req.user.id);
    res.json({ message: '用户已删除' });
  } catch (error) {
    next(error);
  }
}

async function listMedia(req, res, next) {
  try {
    const media = await adminMediaQueryService.listMedia(req.query);
    res.json({ media });
  } catch (error) {
    next(error);
  }
}

async function deleteMedia(req, res, next) {
  try {
    const mediaId = parseId(req.params.id, '媒体 ID');
    await adminMediaService.deleteMedia(mediaId, req.user);
    res.json({ message: '媒体已删除' });
  } catch (error) {
    next(error);
  }
}

async function deleteMediaBatch(req, res, next) {
  try {
    const result = await adminMediaService.deleteMediaBatch(req.body.ids, req.user);
    res.json({ message: `已删除 ${result.count} 条媒体`, count: result.count, ids: result.ids });
  } catch (error) {
    next(error);
  }
}

async function listAlbums(req, res, next) {
  try {
    const albums = await adminAlbumQueryService.listAlbums(req.query);
    res.json({ albums });
  } catch (error) {
    next(error);
  }
}

async function deleteAlbum(req, res, next) {
  try {
    const albumId = parseId(req.params.id, '相册 ID');
    await adminAlbumService.deleteAlbum(albumId);
    res.json({ message: '相册已删除' });
  } catch (error) {
    next(error);
  }
}

async function deleteAlbumBatch(req, res, next) {
  try {
    const result = await adminAlbumService.deleteAlbums(req.body.ids);
    res.json({ message: `已删除 ${result.count} 个相册`, count: result.count, ids: result.ids });
  } catch (error) {
    next(error);
  }
}

async function setAlbumCover(req, res, next) {
  try {
    const albumId = parseId(req.params.id, '相册 ID');
    const coverUrl = req.file
      ? await adminAlbumService.setCoverFromUpload(albumId, req.file)
      : await adminAlbumService.setCoverFromAlbumMedia(albumId, req.body.cover_url);
    res.json({ message: '封面已更新', cover_url: coverUrl });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listUsers,
  updateUser,
  deleteUser,
  listMedia,
  deleteMedia,
  deleteMediaBatch,
  listAlbums,
  deleteAlbum,
  deleteAlbumBatch,
  setAlbumCover,
};
