const { FeaturedDeal } = require("../models");

// Public: get all active deals
exports.getPublicDeals = async (req, res) => {
  try {
    const deals = await FeaturedDeal.findAll({
      where: { is_active: 1, is_deleted: 0 },
      order: [
        ["sort_order", "ASC"],
        ["created_at", "DESC"],
      ],
    });
    return res.json({ deals });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Admin: get all deals (including inactive)
exports.getAdminDeals = async (req, res) => {
  try {
    const deals = await FeaturedDeal.findAll({
      where: { is_deleted: 0 },
      order: [
        ["sort_order", "ASC"],
        ["created_at", "DESC"],
      ],
    });
    return res.json({ deals });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Admin: create deal
exports.createDeal = async (req, res) => {
  try {
    const { title, description, image, url, countdown_end, is_active, sort_order } = req.body;
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    const deal = await FeaturedDeal.create({
      title: String(title).trim(),
      description: description || "",
      image: image || "",
      url: url || "",
      countdown_end: countdown_end || null,
      is_active: is_active !== undefined ? Number(is_active) : 1,
      sort_order: sort_order !== undefined ? Number(sort_order) : 0,
    });
    return res.status(201).json(deal);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Admin: update deal
exports.updateDeal = async (req, res) => {
  try {
    const deal = await FeaturedDeal.findOne({ where: { id: req.params.id, is_deleted: 0 } });
    if (!deal) return res.status(404).json({ message: "Deal not found" });

    const { title, description, image, url, countdown_end, is_active, sort_order } = req.body;
    if (title !== undefined) deal.title = String(title).trim();
    if (description !== undefined) deal.description = description || "";
    if (image !== undefined) deal.image = image || "";
    if (url !== undefined) deal.url = url || "";
    if (countdown_end !== undefined) deal.countdown_end = countdown_end || null;
    if (is_active !== undefined) deal.is_active = Number(is_active);
    if (sort_order !== undefined) deal.sort_order = Number(sort_order);

    await deal.save();
    return res.json(deal);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Admin: delete deal
exports.deleteDeal = async (req, res) => {
  try {
    const deal = await FeaturedDeal.findOne({ where: { id: req.params.id, is_deleted: 0 } });
    if (!deal) return res.status(404).json({ message: "Deal not found" });

    deal.is_deleted = 1;
    await deal.save();
    return res.json({ message: "Deal deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
