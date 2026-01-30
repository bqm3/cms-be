const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/public', templateController.getPublicTemplates);
router.get('/public/:identifier', templateController.getTemplateDetail);

// Protected routes (User + Admin)
router.post('/', authMiddleware, upload.single('logo'), templateController.createTemplate);
router.put('/:id', authMiddleware, upload.single('logo'), templateController.updateTemplate);

// Admin routes
router.get('/admin', authMiddleware, templateController.getAllTemplatesAdmin);
router.patch('/:id/approve', authMiddleware, adminMiddleware, templateController.approveTemplate);
router.delete('/:id', authMiddleware, adminMiddleware, templateController.deleteTemplate);

module.exports = router;
