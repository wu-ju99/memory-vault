const albumManagementService = require('../services/albumManagementService');
const albumCoverService = require('../services/albumCoverService');
const albumQueryService = require('../services/albumQueryService');
const parseId = require('../utils/parseId');

async function create(req, res, next) {
  try {
    const album = await albumManagementService.createAlbum(req.user.id, req.body.title, req.body.album_year);
    res.status(201).json(album);
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const rows = await albumQueryService.listAlbums(req.query);
    res.json({ albums: rows });
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const albumId = parseId(req.params.id, '相册 ID');
    const album = await albumQueryService.getAlbumById(albumId);
    if (!album) {
      return res.status(404).json({ message: '相册不存在' });
    }
    res.json({ album });
  } catch (error) {
    next(error);
  }
}

async function setCover(req, res, next) {
  try {
    const albumId = parseId(req.params.id, '相册 ID');
    const coverUrl = req.file
      ? await albumCoverService.setCoverFromUpload(albumId, req.file)
      : await albumCoverService.setCoverFromAlbumMedia(albumId, req.body.cover_url);

    res.json({ message: '封面已更新', cover_url: coverUrl });
  } catch (error) {
    next(error);
  }
}

async function rename(req, res, next) {
  try {
    const albumId = parseId(req.params.id, '相册 ID');
    const updated = await albumManagementService.renameAlbum(albumId, req.user.id, req.body.title);
    res.json({ message: '相册名称已更新', album: updated });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const albumId = parseId(req.params.id, '相册 ID');
    await albumManagementService.deleteAlbum(albumId, req.user.id);
    res.json({ message: '相册已删除' });
  } catch (error) {
    next(error);
  }
}

module.exports = { create, list, show, setCover, rename, remove };
