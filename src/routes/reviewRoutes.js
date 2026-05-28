const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

router.get("/public", reviewController.getPublicReviews);
router.get("/public/:identifier", reviewController.getPublicReviewDetail);

router.get("/", authMiddleware, adminMiddleware, reviewController.getAdminReviews);
router.post("/", authMiddleware, adminMiddleware, reviewController.createReview);
router.put("/:id", authMiddleware, adminMiddleware, reviewController.updateReview);
router.delete("/:id", authMiddleware, adminMiddleware, reviewController.deleteReview);

module.exports = router;
