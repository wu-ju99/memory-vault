/**
 * 相册路由
 * POST /api/albums      → 创建相册
 * GET  /api/albums      → 相册列表
 */

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const albumController = require('../controllers/albumController');

router.post('/albums', auth, albumController.create);
router.get('/albums', auth, albumController.list);

module.exports = router;
