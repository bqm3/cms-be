const { Template, User, Category } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const slugify = require('../utils/slugify');

function generateSlug(title) {
  const baseSlug = slugify(title, { lower: true, strict: true });
  const random = crypto.randomInt(100000, 1000000); // 6 số
  return `${baseSlug}-${random}`;
}

// Public: Get all approved templates
exports.getPublicTemplates = async (req, res) => {
  try {
    const { sort, category } = req.query;
    let order = [['sequence_number', 'ASC']];
    
    if (sort) {
      const [field, direction] = sort.split(':');
      if (['view_count', 'sequence_number', 'created_at'].includes(field)) {
        order = [[field, direction || 'DESC']];
      }
    }

    let where = { is_approved: true, is_deleted: 0 };
    if (category) {
      where.category_id = category;
    }

    const templates = await Template.findAll({
      where,
      order,
      include: [
        { model: User, as: 'creator', attributes: ['username'] },
        { model: Category, as: 'category', attributes: ['name'] }
      ]
    });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Public/User: Get single template and increment view
exports.getTemplateDetail = async (req, res) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);
    
    const template = await Template.findOne({
      where: {
        ...(isNumeric ? { [Op.or]: [{ id: identifier }, { slug: identifier }] } : { slug: identifier }),
        is_deleted: 0
      },
      include: [
        { model: User, as: 'creator', attributes: ['username'] },
        { model: Category, as: 'category', attributes: ['name'] }
      ]
    });

    if (!template) return res.status(404).json({ message: 'Template not found' });
    
    // Increment view count ONLY if in preview mode
    if (req.query.preview === 'true') {
      template.view_count += 1;
      await template.save();
    }

    res.json(template);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User: Create template
exports.createTemplate = async (req, res) => {
  try {
    const {
      sequence_number,
      title,
      template_title,
      content,
      category_id,
      topic_name,
      view_count,
    } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const cleanTitle = (title ?? "").trim();
    if (!cleanTitle) {
      return res.status(400).json({ message: "Tiêu đề là bắt buộc" });
    }

    let catId = null;
    if (
      category_id !== undefined &&
      category_id !== null &&
      String(category_id).trim() !== ""
    ) {
      catId = Number(category_id);
      if (Number.isNaN(catId)) {
        return res.status(400).json({ message: "Danh mục không hợp lệ" });
      }
    }

    const logo = req.file ? `/uploads/${req.file.filename}` : null;
    const slug = await generateSlug(cleanTitle);

    const template = await Template.create({
      sequence_number: Number(sequence_number) || 0,
      title: cleanTitle,
      template_title: (template_title ?? "").trim() || null,
      content: content ?? "",
      category_id: catId,
      topic_name: (topic_name ?? "").trim() || null,
      view_count: Number(view_count) || 0,
      logo,
      slug: slug,
      created_by: req.user.id,
      is_approved: req.user.role === "admin",
    });

    return res.status(201).json(template);
  } catch (err) {
    console.error("CREATE TEMPLATE ERROR:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// Admin/User: Get templates for dashboard
exports.getAllTemplatesAdmin = async (req, res) => {
  try {
    const { category, parentCategory, topic, sort, search, startDate, endDate } = req.query;
    
    let where = { is_deleted: 0 };
    
    // Role based filtering
    if (req.user.role !== 'admin') {
      where.created_by = req.user.id;
    }
    
    if (category) where.category_id = category;
    if (topic) where.topic_name = topic;

    let categoryWhere = {};
    if (parentCategory) {
      categoryWhere.parent_id = parentCategory;
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { template_title: { [Op.like]: `%${search}%` } }
      ];
    }
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59')]
      };
    } else if (startDate) {
      where.created_at = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.created_at = { [Op.lte]: new Date(endDate + 'T23:59:59') };
    }

    let order = [['created_at', 'DESC']];
    if (sort) {
      try {
        const [field, direction] = sort.split(':');
        order = [[field, direction]];
      } catch (e) {}
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: templates } = await Template.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [
        { model: User, as: 'creator', attributes: ['username'] },
        { model: User, as: 'updater', attributes: ['username'] },
        { 
          model: Category, 
          as: 'category', 
          attributes: ['name', 'parent_id'],
          where: Object.keys(categoryWhere).length > 0 ? categoryWhere : undefined,
          required: Object.keys(categoryWhere).length > 0
        }
      ]
    });

    res.json({
      templates,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin/User: Update template
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await Template.findByPk(id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check permission
    if (req.user.role !== 'admin' && template.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const {
      sequence_number,
      title,
      template_title,
      content,
      category_id,
      topic_name,
      view_count,
    } = req.body;

    const cleanTitle = (title ?? "").trim();
    if (!cleanTitle) {
      return res.status(400).json({ message: "Tiêu đề là bắt buộc" });
    }

    let catId = null;
    if (
      category_id !== undefined &&
      category_id !== null &&
      String(category_id).trim() !== ""
    ) {
      catId = Number(category_id);
      if (Number.isNaN(catId)) {
        return res.status(400).json({ message: "Danh mục không hợp lệ" });
      }
    }

    const logo = req.file ? `/uploads/${req.file.filename}` : template.logo;

    await template.update({
      sequence_number: Number(sequence_number) || template.sequence_number,
      title: cleanTitle,
      template_title: (template_title ?? "").trim() || null,
      content: content ?? template.content,
      category_id: catId,
      topic_name: (topic_name ?? "").trim() || null,
      view_count: Number(view_count) || template.view_count,
      logo,
      updated_by: req.user.id,
      is_approved: req.user.role === "admin" ? template.is_approved : false,
    });

    res.json(template);
  } catch (err) {
    console.error("UPDATE TEMPLATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// Admin: Approve template
exports.approveTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await Template.findByPk(id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    await template.update({ is_approved: true });
    res.json({ message: 'Template approved', template });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin/User: Delete template (soft delete)
exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await Template.findByPk(id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check permission
    if (req.user.role !== 'admin' && template.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await template.update({ is_deleted: 1 });
    res.json({ message: 'Template deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
