const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/bannerController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public
router.get("/public", bannerController.getPublicBanners);

// Admin
router.get("/", authMiddleware, adminMiddleware, bannerController.getAdminBanners);
router.post("/", authMiddleware, adminMiddleware, upload.banner.single("image"), bannerController.createBanner);
router.put("/:id", authMiddleware, adminMiddleware, upload.banner.single("image"), bannerController.updateBanner);
router.delete("/:id", authMiddleware, adminMiddleware, bannerController.deleteBanner);

module.exports = router;
