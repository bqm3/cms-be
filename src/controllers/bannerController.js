const { Banner } = require("../models");

// Public: get active banners
exports.getPublicBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      where: { is_active: 1, is_deleted: 0 },
      order: [
        ["sort_order", "ASC"],
        ["created_at", "DESC"],
      ],
    });
    return res.json({ banners });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Admin: get all banners (including inactive)
exports.getAdminBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      where: { is_deleted: 0 },
      order: [
        ["sort_order", "ASC"],
        ["created_at", "DESC"],
      ],
    });
    return res.json({ banners });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Admin: create banner
exports.createBanner = async (req, res) => {
  try {
    const { title, description, url, is_active, sort_order } = req.body;
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    const image = req.file ? `/uploads/banners/${req.file.filename}` : (req.body.image || "");
    const banner = await Banner.create({
      title: String(title).trim(),
      description: description || "",
      image,
      url: url || "",
      is_active: is_active !== undefined ? Number(is_active) : 1,
      sort_order: sort_order !== undefined ? Number(sort_order) : 0,
    });
    return res.status(201).json(banner);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Admin: update banner
exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findOne({ where: { id: req.params.id, is_deleted: 0 } });
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    const { title, description, url, is_active, sort_order } = req.body;
    if (title !== undefined) banner.title = String(title).trim();
    if (description !== undefined) banner.description = description || "";
    if (url !== undefined) banner.url = url || "";
    if (is_active !== undefined) banner.is_active = Number(is_active);
    if (sort_order !== undefined) banner.sort_order = Number(sort_order);
    if (req.file) {
      banner.image = `/uploads/banners/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      banner.image = req.body.image || "";
    }

    await banner.save();
    return res.json(banner);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Admin: delete banner
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findOne({ where: { id: req.params.id, is_deleted: 0 } });
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    banner.is_deleted = 1;
    await banner.save();
    return res.json({ message: "Banner deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
