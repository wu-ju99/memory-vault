const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const albumController = require('../controllers/albumController');

router.post('/albums', auth, albumController.create);
router.get('/albums', auth, albumController.list);
router.put('/albums/:id/cover', auth, (req, res, next) => {
  upload.single('cover')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: '封面文件不能超过 10MB' });
      }
      return res.status(400).json({ message: err.message });
    }
    return albumController.setCover(req, res, next);
  });
});

module.exports = router;
