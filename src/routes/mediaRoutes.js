const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', authMiddleware, mediaController.getAllMedia);
router.post('/', authMiddleware, upload.image.single('file'), mediaController.createMedia);
router.delete('/:id', authMiddleware, mediaController.deleteMedia);

module.exports = router;
