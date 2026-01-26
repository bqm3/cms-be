const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/public', postController.getPublicPosts);
router.get('/public/:identifier', postController.getPostDetail);

// Protected routes (User + Admin)
router.post('/', authMiddleware, upload.single('logo'), postController.createPost);
router.put('/:id', authMiddleware, upload.single('logo'), postController.updatePost);

// Admin routes
router.get('/admin', authMiddleware, postController.getAllPostsAdmin);
router.patch('/:id/approve', authMiddleware, adminMiddleware, postController.approvePost);
router.delete('/:id', authMiddleware, adminMiddleware, postController.deletePost);

module.exports = router;
