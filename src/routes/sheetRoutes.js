const express = require("express");
const router = express.Router();

const sheetController = require("../controllers/sheetController");
const permissionController = require("../controllers/sheetPermissionController");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

/**
 * ======================
 * SHEET (Bảng)
 * ======================
 */

// Public: xem sheet dạng excel (columns + rows + cells)
router.get("/:id", sheetController.getSheetById);

// Authenticated users: list sheets (admins see all, users see filtered)
router.get("/", authMiddleware, sheetController.getAllSheets);

// Admin: create sheet (có thể tạo kèm columns)
router.post("/", authMiddleware, adminMiddleware, sheetController.createSheet);

// Admin: update sheet info
router.put("/:id", authMiddleware, adminMiddleware, sheetController.updateSheet);

// Admin: delete sheet (xoá luôn columns/rows/cells nếu bạn bật cascade)
router.delete("/:id", authMiddleware, adminMiddleware, sheetController.deleteSheet);

/**
 * ======================
 * COLUMNS (Cột)
 * ======================
 */
router.get("/:sheetId/columns", sheetController.getColumns);
router.post("/:sheetId/columns", authMiddleware, adminMiddleware, sheetController.createColumn);
router.put("/:sheetId/columns/:columnId", authMiddleware, adminMiddleware, sheetController.updateColumn);
router.delete("/:sheetId/columns/:columnId", authMiddleware, adminMiddleware, sheetController.deleteColumn);

/**
 * ======================
 * ROWS (Dòng)
 * ======================
 */
router.get("/:sheetId/rows", sheetController.getRows);
router.post("/:sheetId/rows", authMiddleware, adminMiddleware, sheetController.createRow);
router.put("/:sheetId/rows/:rowId", authMiddleware, adminMiddleware, sheetController.updateRow);
router.delete("/:sheetId/rows/:rowId", authMiddleware, adminMiddleware, sheetController.deleteRow);

/**
 * ======================
 * CELLS (Ô) - update kiểu Excel
 * ======================
 * Bulk update cells:
 * body: { cells: [{ rowId, columnId, value, numeric_value, meta }] }
 */
router.put("/:sheetId/cells/bulk", authMiddleware, adminMiddleware, sheetController.bulkUpsertCells);

// List rows (search/sort/pagination)
router.get("/:sheetId/rows/list", authMiddleware, sheetController.listRows);

/**
 * ======================
 * PERMISSIONS (Cấp quyền)
 * ======================
 */
router.get("/permissions/:userId", authMiddleware, adminMiddleware, permissionController.getUserSheetPermissions);
router.post("/permissions/sync", authMiddleware, adminMiddleware, permissionController.syncUserPermissions);
router.post("/permissions/assign", authMiddleware, adminMiddleware, permissionController.assignSheetPermission);
router.delete("/permissions/remove", authMiddleware, adminMiddleware, permissionController.removeSheetPermission);
module.exports = router;