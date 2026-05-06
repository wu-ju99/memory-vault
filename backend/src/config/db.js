/**
 * 数据库连接配置 (MySQL)
 * 使用 mysql2 连接池，启动时测试连接
 */

const mysql = require('mysql2/promise');

// 数据库连接参数（占位符，部署时替换为真实账号）
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'memory_vault',
  waitForConnections: true,
  connectionLimit: 10,
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

/**
 * 测试数据库连接
 * 启动时调用，打印连接成功或失败信息
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('[DB] MySQL 连接成功');
    connection.release();
  } catch (error) {
    console.error('[DB] MySQL 连接失败:', error.message);
    console.error('[DB] 请确认 MySQL 服务已启动且账号密码正确');
  }
}

module.exports = { pool, testConnection };
