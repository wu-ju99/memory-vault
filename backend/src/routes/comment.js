/**
 * 评论路由
 * POST   /api/comments          → 发表评论
 * GET    /api/comments/:mediaId → 获取评论列表
 * DELETE /api/comments/:id      → 删除评论
 */

const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const commentController = require('../controllers/commentController');

router.post('/comments', auth, commentController.create);
router.get('/comments/:mediaId', auth, commentController.list);
router.delete('/comments/:id', auth, commentController.remove);

module.exports = router;
