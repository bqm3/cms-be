const express = require("express");
const router = express.Router();
const postLinkController = require("../controllers/postLinkController");
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public (or maybe restricted to auth depending on requirements)
router.get("/:postId", postLinkController.getPostLinks);

// Restricted to authenticated users
router.post("/", authMiddleware, adminMiddleware, postLinkController.createPostLink);
router.put("/:id", authMiddleware, adminMiddleware, postLinkController.updatePostLink);
router.delete("/:id", authMiddleware, adminMiddleware, postLinkController.deletePostLink);
router.post("/bulk/:postId", authMiddleware, adminMiddleware, postLinkController.bulkUpdateLinks);

module.exports = router;
