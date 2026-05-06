/**
 * 基础请求日志中间件
 * 记录每个请求的方法、路径和耗时
 */

function requestLogger(req, res, next) {
  const start = Date.now();

  // 响应结束时打印日志
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`
    );
  });

  next();
}

module.exports = requestLogger;
