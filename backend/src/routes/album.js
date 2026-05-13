const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { withUpload } = require('../middlewares/uploadErrors');
const albumController = require('../controllers/albumController');

router.post('/albums', auth, albumController.create);
router.get('/albums', auth, albumController.list);
router.get('/albums/:id', auth, albumController.show);
router.put('/albums/:id', auth, albumController.rename);
router.delete('/albums/:id', auth, albumController.remove);
router.put(
  '/albums/:id/cover',
  auth,
  withUpload(upload.single('cover'), { fileSizeMessage: '封面文件不能超过 10MB' }),
  albumController.setCover
);

module.exports = router;
