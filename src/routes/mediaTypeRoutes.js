const express = require('express');
const router = express.Router();
const mediaTypeController = require('../controllers/mediaTypeController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', mediaTypeController.getAllMediaTypes);
router.post('/', authMiddleware, adminMiddleware, mediaTypeController.createMediaType);
router.put('/:id', authMiddleware, adminMiddleware, mediaTypeController.updateMediaType);
router.delete('/:id', authMiddleware, adminMiddleware, mediaTypeController.deleteMediaType);

module.exports = router;
