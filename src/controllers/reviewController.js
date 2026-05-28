const { Review } = require("../models");
const { Op } = require("sequelize");
const crypto = require("crypto");
const slugify = require("../utils/slugify");

function generateSlug(title) {
  const baseSlug = slugify(title, { lower: true, strict: true });
  const random = crypto.randomInt(100000, 1000000);
  return `${baseSlug}-${random}`;
}

function buildAutoMetaFromTitle(titleRaw) {
  const t = String(titleRaw || "").trim();
  if (!t) return { meta_title: null, meta_keyword: null, meta_description: null };

  return {
    meta_title: `${t} promotion latest`,
    meta_keyword: `${t}, ${t} promotion, ${t} promotion newest`,
    meta_description:
      `Use Globalpromotionllc.com to find the latest discount codes and best deals when shopping ` +
      `online at ${t} through Globalpromotionllc.com. Save more on every order with our verified discount codes, ` +
      `food coupons, and cashback offers.`,
  };
}

function parseBool(v) {
  return v === true || v === "true" || v === "1" || v === 1;
}

exports.getPublicReviews = async (req, res) => {
  try {
    const { page = 1, limit = 9, search } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 9, 1), 50);
    const offset = (pageNum - 1) * limitNum;

    const where = { is_deleted: 0 };
    if (search && String(search).trim()) {
      const s = String(search).trim();
      where[Op.or] = [
        { title: { [Op.like]: `%${s}%` } },
        { content: { [Op.like]: `%${s}%` } },
        { description: { [Op.like]: `%${s}%` } },
        { slug: { [Op.like]: `%${s}%` } },
      ];
    }

    const { count, rows } = await Review.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: limitNum,
      offset,
    });

    return res.json({
      reviews: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getPublicReviewDetail = async (req, res) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);

    const review = await Review.findOne({
      where: {
        ...(isNumeric ? { [Op.or]: [{ id: identifier }, { slug: identifier }] } : { slug: identifier }),
        is_deleted: 0,
      },
    });

    if (!review) return res.status(404).json({ message: "Review not found" });
    return res.json(review);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getAdminReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const offset = (pageNum - 1) * limitNum;

    const where = { is_deleted: 0 };
    if (search && String(search).trim()) {
      const s = String(search).trim();
      where[Op.or] = [
        { title: { [Op.like]: `%${s}%` } },
        { slug: { [Op.like]: `%${s}%` } },
      ];
    }

    const { count, rows } = await Review.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: limitNum,
      offset,
      attributes: { exclude: ["content"] },
    });

    return res.json({
      reviews: rows,
      total: count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { title, content, description, img_bg, meta_title, meta_keyword, meta_description, meta_override } = req.body;
    const cleanTitle = String(title || "").trim();

    if (!cleanTitle) {
      return res.status(400).json({ message: "Title is required" });
    }

    const override = parseBool(meta_override);
    const autoMeta = buildAutoMetaFromTitle(cleanTitle);

    const review = await Review.create({
      title: cleanTitle,
      slug: generateSlug(cleanTitle),
      content: content || "",
      description: description || "",
      img_bg: img_bg || "",
      ...(override
        ? {
            meta_title: String(meta_title || "").trim(),
            meta_keyword: String(meta_keyword || "").trim(),
            meta_description: String(meta_description || "").trim(),
            meta_override: true,
          }
        : {
            ...autoMeta,
            meta_override: false,
          }),
    });

    return res.status(201).json(review);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findOne({ where: { id: req.params.id, is_deleted: 0 } });
    if (!review) return res.status(404).json({ message: "Review not found" });

    const { title, content, description, img_bg, meta_title, meta_keyword, meta_description, meta_override } = req.body;

    if (title !== undefined) review.title = String(title || "").trim();
    if (content !== undefined) review.content = content || "";
    if (description !== undefined) review.description = description || "";
    if (img_bg !== undefined) review.img_bg = img_bg || "";

    if (meta_override !== undefined) {
      const override = parseBool(meta_override);
      if (override) {
        review.meta_title = String(meta_title || "").trim();
        review.meta_keyword = String(meta_keyword || "").trim();
        review.meta_description = String(meta_description || "").trim();
        review.meta_override = true;
      } else {
        Object.assign(review, buildAutoMetaFromTitle(review.title));
        review.meta_override = false;
      }
    }

    await review.save();
    return res.json(review);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({ where: { id: req.params.id, is_deleted: 0 } });
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.is_deleted = 1;
    await review.save();

    return res.json({ message: "Review deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
