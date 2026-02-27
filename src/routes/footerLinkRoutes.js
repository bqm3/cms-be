const express = require("express");
const router = express.Router();
const footerLinkController = require("../controllers/footerLinkController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

router.get("/", footerLinkController.getAll);
router.put("/bulk", authMiddleware, adminMiddleware, footerLinkController.updateAll);
router.post("/", authMiddleware, adminMiddleware, footerLinkController.create);
router.delete("/:id", authMiddleware, adminMiddleware, footerLinkController.delete);

module.exports = router;
