const { ParentCategory, Category } = require("../models");
const { Op } = require("sequelize");

exports.getAllParentCategories = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : null;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const { search, startDate, endDate } = req.query;

    let where = { is_deleted: 0 };
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate + "T23:59:59")],
      };
    } else if (startDate) {
      where.created_at = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.created_at = { [Op.lte]: new Date(endDate + "T23:59:59") };
    }

    const include = [
      {
        model: Category,
        as: "subcategories",
        where: { is_deleted: 0 },
        required: false,
        order: [
          ["sequence_number", "ASC"],
          ["name", "ASC"],
        ],
      },
    ];

    if (page && limit) {
      const offset = (page - 1) * limit;
      const { count, rows: parentCategories } = await ParentCategory.findAndCountAll({
        where,
        order: [
          ["sequence_number", "ASC"],
          ["name", "ASC"],
        ],
        limit,
        offset,
        include,
      });
      return res.json({
        parentCategories,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    }

    const parentCategories = await ParentCategory.findAll({
      where,
      order: [
        ["sequence_number", "ASC"],
        ["name", "ASC"],
      ],
      include,
    });
    res.json(parentCategories);
  } catch (err) {
    if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(", ") });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.createParentCategory = async (req, res) => {
  try {
    const { name, slug, sequence_number } = req.body;
    const parentCategory = await ParentCategory.create({ name, slug, sequence_number });
    res.status(201).json(parentCategory);
  } catch (err) {
    if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(", ") });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.updateParentCategory = async (req, res) => {
  try {
    const { name, slug, sequence_number } = req.body;
    const parentCategory = await ParentCategory.findOne({ where: { id: req.params.id, is_deleted: 0 } });
    if (!parentCategory) return res.status(404).json({ message: "Parent Category not found" });

    parentCategory.name = name || parentCategory.name;
    parentCategory.slug = slug || parentCategory.slug;
    if (sequence_number !== undefined) parentCategory.sequence_number = sequence_number;

    await parentCategory.save();

    res.json(parentCategory);
  } catch (err) {
    if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(", ") });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.deleteParentCategory = async (req, res) => {
  try {
    const parentCategory = await ParentCategory.findOne({ where: { id: req.params.id, is_deleted: 0 } });
    if (!parentCategory) return res.status(404).json({ message: "Parent Category not found" });

    parentCategory.is_deleted = 1;
    await parentCategory.save();

    // Optionally soft delete all subcategories?
    // Usually it's better to keep them or update them to have no parent.
    // User didn't specify, so I'll just delete the parent.

    res.json({ message: "Parent Category deleted" });
  } catch (err) {
    if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: err.errors.map((e) => e.message).join(", ") });
    }
    res.status(500).json({ message: err.message });
  }
};
