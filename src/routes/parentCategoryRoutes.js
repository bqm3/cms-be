const express = require('express');
const router = express.Router();
const parentCategoryController = require('../controllers/parentCategoryController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public route to get parent categories
router.get('/', parentCategoryController.getAllParentCategories);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, parentCategoryController.createParentCategory);
router.put('/:id', authMiddleware, adminMiddleware, parentCategoryController.updateParentCategory);
router.delete('/:id', authMiddleware, adminMiddleware, parentCategoryController.deleteParentCategory);

module.exports = router;
