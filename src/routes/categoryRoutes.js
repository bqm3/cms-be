const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public route to get categories (e.g. for post creation dropdown)
router.get('/', categoryController.getAllCategories);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, upload.category.single('image'), categoryController.createCategory);
router.put('/:id', authMiddleware, adminMiddleware, upload.category.single('image'), categoryController.updateCategory);
router.delete('/:id', authMiddleware, adminMiddleware, categoryController.deleteCategory);

module.exports = router;
