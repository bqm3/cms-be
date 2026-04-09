const { User, Sheet, UserSheetPermission } = require("../models");

exports.getUserSheetPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const permissions = await UserSheetPermission.findAll({
      where: { user_id: userId },
    });
    res.json({ data: permissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.assignSheetPermission = async (req, res) => {
  try {
    const { userId, sheetId } = req.body;
    if (!userId || !sheetId) {
      return res.status(400).json({ message: "userId and sheetId are required" });
    }

    // Check if permission already exists
    const existing = await UserSheetPermission.findOne({
      where: { user_id: userId, sheet_id: sheetId },
    });
    if (existing) {
      return res.status(400).json({ message: "Permission already exists" });
    }

    const permission = await UserSheetPermission.create({
      user_id: userId,
      sheet_id: sheetId,
    });

    res.status(201).json({ data: permission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeSheetPermission = async (req, res) => {
  try {
    const { userId, sheetId } = req.body;
    if (!userId || !sheetId) {
      return res.status(400).json({ message: "userId and sheetId are required" });
    }

    await UserSheetPermission.destroy({
      where: { user_id: userId, sheet_id: sheetId },
    });

    res.json({ message: "Permission removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.syncUserPermissions = async (req, res) => {
  try {
    const { userId, sheetIds } = req.body; // sheetIds is an array of IDs the user SHOULD have
    if (!userId || !Array.isArray(sheetIds)) {
      return res.status(400).json({ message: "userId and sheetIds array are required" });
    }

    // Remove existing
    await UserSheetPermission.destroy({
      where: { user_id: userId },
    });

    // Bulk create new
    if (sheetIds.length > 0) {
      const payload = sheetIds.map((sid) => ({
        user_id: userId,
        sheet_id: sid,
      }));
      await UserSheetPermission.bulkCreate(payload);
    }

    res.json({ message: "Permissions synced" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
