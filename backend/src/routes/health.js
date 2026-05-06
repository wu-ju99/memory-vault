/**
 * 健康检查路由
 * GET /api/health → 返回服务状态
 */

const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

router.get('/health', healthController.getHealth);

module.exports = router;
