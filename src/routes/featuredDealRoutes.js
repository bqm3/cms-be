const express = require("express");
const router = express.Router();
const featuredDealController = require("../controllers/featuredDealController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

// Public
router.get("/public", featuredDealController.getPublicDeals);

// Admin
router.get("/", authMiddleware, adminMiddleware, featuredDealController.getAdminDeals);
router.post("/", authMiddleware, adminMiddleware, featuredDealController.createDeal);
router.put("/:id", authMiddleware, adminMiddleware, featuredDealController.updateDeal);
router.delete("/:id", authMiddleware, adminMiddleware, featuredDealController.deleteDeal);

module.exports = router;
