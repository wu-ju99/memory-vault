const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const adminOnly = require('../middlewares/adminOnly');
const upload = require('../middlewares/upload');
const { withUpload } = require('../middlewares/uploadErrors');
const adminController = require('../controllers/adminController');

router.use('/admin', auth, adminOnly);

router.get('/admin/users', adminController.listUsers);
router.put('/admin/users/:id', adminController.updateUser);
router.delete('/admin/users/:id', adminController.deleteUser);

router.get('/admin/media', adminController.listMedia);
router.delete('/admin/media/batch', adminController.deleteMediaBatch);
router.delete('/admin/media/:id', adminController.deleteMedia);

router.get('/admin/albums', adminController.listAlbums);
router.delete('/admin/albums/batch', adminController.deleteAlbumBatch);
router.delete('/admin/albums/:id', adminController.deleteAlbum);
router.put(
  '/admin/albums/:id/cover',
  withUpload(upload.single('cover'), { fileSizeMessage: '封面文件不能超过 10MB' }),
  adminController.setAlbumCover
);

module.exports = router;
