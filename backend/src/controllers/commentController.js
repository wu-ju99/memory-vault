/**
 * 评论控制器（支持回复/树形结构）
 */

const commentService = require('../services/commentService');

// 将平铺数据转为树结构
function buildTree(comments) {
  const map = {};
  const roots = [];

  comments.forEach((c) => {
    c.replies = [];
    map[c.id] = c;
  });

  comments.forEach((c) => {
    if (c.parent_id) {
      map[c.parent_id]?.replies.push(c);
    } else {
      roots.push(c);
    }
  });

  return roots;
}

// POST /api/comments
async function create(req, res, next) {
  try {
    const { media_id, content, parent_id } = req.body;
    if (!media_id) return res.status(400).json({ message: 'media_id 不能为空' });
    if (!content || !content.trim()) return res.status(400).json({ message: '评论内容不能为空' });

    const parentId = parent_id ? parseInt(parent_id, 10) || null : null;
    const result = await commentService.create(req.user.id, media_id, content.trim(), parentId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

// GET /api/comments/:mediaId（返回树结构）
async function list(req, res, next) {
  try {
    const mediaId = parseInt(req.params.mediaId, 10);
    const rows = await commentService.getByMedia(mediaId);
    res.json({ comments: buildTree(rows) });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/comments/:id（级联删除回复）
async function remove(req, res, next) {
  try {
    const commentId = parseInt(req.params.id, 10);
    const { pool } = require('../config/db');
    const [rows] = await pool.query(
      'SELECT user_id FROM comments WHERE id = ?', [commentId]
    );
    if (rows.length === 0) return res.status(404).json({ message: '评论不存在' });
    if (rows[0].user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: '无权删除' });

    await commentService.deleteById(commentId);
    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
}

module.exports = { create, list, remove };
