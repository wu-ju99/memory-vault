/**
 * 路由汇总入口
 * 将所有子路由挂载到 /api 前缀下
 */

const express = require('express');
const router = express.Router();

const healthRoutes = require('./health');

// 挂载健康检查路由
router.use(healthRoutes);

module.exports = router;
