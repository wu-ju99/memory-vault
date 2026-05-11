function handleUploadError(options = {}) {
  const {
    fileSizeMessage = '文件大小超出限制',
    fileCountMessage = '一次上传的文件数量超出限制',
  } = options;

  return function uploadErrorHandler(err, req, res, next) {
    if (!err) {
      return next();
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: fileSizeMessage });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: fileCountMessage });
    }
    if (err.name === 'MulterError') {
      return res.status(400).json({ message: err.message });
    }
    return res.status(400).json({ message: err.message });
  };
}

function withUpload(uploadMiddleware, errorOptions) {
  const uploadErrorHandler = handleUploadError(errorOptions);

  return function wrappedUpload(req, res, next) {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return uploadErrorHandler(err, req, res, next);
      }
      return next();
    });
  };
}

module.exports = {
  handleUploadError,
  withUpload,
};
