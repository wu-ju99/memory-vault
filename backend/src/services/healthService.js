/**
 * 健康检查服务
 * 返回服务运行状态
 */

function getHealthStatus() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}

module.exports = { getHealthStatus };
