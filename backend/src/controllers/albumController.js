/**
 * 相册控制器
 */

const albumService = require('../services/albumService');

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

module.exports = { create, list };
