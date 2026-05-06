/**
 * 服务启动入口
 * 初始化数据库连接并启动 HTTP 服务
 */

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 3000;

async function start() {
  // 尝试连接数据库
  await testConnection();

  // 启动 HTTP 服务
  app.listen(PORT, () => {
    console.log(`[Server] 服务已启动: http://localhost:${PORT}`);
    console.log(`[Server] 健康检查: http://localhost:${PORT}/api/health`);
  });
}

start();
