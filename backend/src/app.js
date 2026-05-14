/**
 * Express 应用初始化
 * 注册中间件和路由
 */

const express = require('express');
const path = require('path');
const requestLogger = require('./middlewares/logger');
const routes = require('./routes');

const app = express();

// --- 中间件 ---

// 解析 JSON 请求体
app.use(express.json());

// 基础请求日志
app.use(requestLogger);

// 静态文件 — 使 /uploads 目录可公开访问
// __dirname = backend/src → ../uploads = backend/uploads
const uploadsPath = path.resolve(__dirname, '../uploads');
console.log('[App] __dirname:', __dirname);
console.log('[App] uploads 静态目录:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// --- 路由 ---

// 挂载 /api 路由
app.use('/api', routes);

// --- multer 错误处理 ---

app.use((err, req, res, next) => {
  // multer 文件过大
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: '文件大小不能超过 10MB' });
  }
  // multer 其他错误（如类型不符）
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// --- 业务错误处理 ---

app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) {
    console.error('[Error]', err);
  }
  if (status >= 500) {
    return res.status(500).json({ message: '服务器内部错误' });
  }
  return res.status(status).json({ message: err.message || '请求失败' });
});

module.exports = app;
