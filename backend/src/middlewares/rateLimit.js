const rateLimit = require('express-rate-limit');

function buildLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  });
}

const authLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: '认证请求过于频繁，请稍后再试',
});

const uploadLimiter = buildLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: '上传请求过于频繁，请稍后再试',
});

const searchLimiter = buildLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: '请求过于频繁，请稍后再试',
});

module.exports = {
  authLimiter,
  uploadLimiter,
  searchLimiter,
};
