/**
 * Express 应用初始化
 * 注册中间件和路由
 */

const express = require('express');
const requestLogger = require('./middlewares/logger');
const routes = require('./routes');

const app = express();

// --- 中间件 ---

// 解析 JSON 请求体
app.use(express.json());

// 基础请求日志
app.use(requestLogger);

// --- 路由 ---

// 挂载 /api 路由
app.use('/api', routes);

module.exports = app;
