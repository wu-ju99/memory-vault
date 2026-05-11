function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: '仅管理员可访问' });
  }
  return next();
}

module.exports = adminOnly;
