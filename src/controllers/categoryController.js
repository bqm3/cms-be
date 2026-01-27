const { Category } = require('../models');
const { Op } = require('sequelize');

exports.getAllCategories = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : null;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const { search, startDate, endDate } = req.query;

    let where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59')]
      };
    } else if (startDate) {
      where.createdAt = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.createdAt = { [Op.lte]: new Date(endDate + 'T23:59:59') };
    }
    
    if (page && limit) {
      const offset = (page - 1) * limit;
      const { count, rows: categories } = await Category.findAndCountAll({
        where,
        order: [['name', 'ASC']],
        limit,
        offset
      });
      return res.json({
        categories,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    }

    const categories = await Category.findAll({
      where,
      order: [['name', 'ASC']]
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, image: imageLink } = req.body;
    
    let image = imageLink || null;
    if (req.file) {
      image = `/uploads/categories/${req.file.filename}`;
    }

    const category = await Category.create({ name, slug, image });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, slug, image: imageLink } = req.body;
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    category.name = name || category.name;
    category.slug = slug || category.slug;
    
    if (req.file) {
      category.image = `/uploads/categories/${req.file.filename}`;
    } else if (imageLink !== undefined) {
      category.image = imageLink;
    }

    await category.save();
    
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    await category.destroy();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
