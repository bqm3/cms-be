const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All user management routes are admin only
router.use(authMiddleware, adminMiddleware);

router.get('/', userController.getAllUsers);
router.post('/', upload.single('avatar'), userController.createUser);
router.put('/:id', upload.single('avatar'), userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
