/**
 * 健康检查控制器
 * 处理 /api/health 请求
 */

const healthService = require('../services/healthService');

function getHealth(req, res) {
  const data = healthService.getHealthStatus();
  res.json(data);
}

module.exports = { getHealth };
