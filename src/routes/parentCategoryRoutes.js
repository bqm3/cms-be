const express = require('express');
const router = express.Router();
const parentCategoryController = require('../controllers/parentCategoryController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public route to get parent categories
router.get('/', parentCategoryController.getAllParentCategories);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, upload.parentCategory.single('image'), parentCategoryController.createParentCategory);
router.put('/:id', authMiddleware, adminMiddleware, upload.parentCategory.single('image'), parentCategoryController.updateParentCategory);
router.delete('/:id', authMiddleware, adminMiddleware, parentCategoryController.deleteParentCategory);

module.exports = router;
