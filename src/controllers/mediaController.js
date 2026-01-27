const { Media } = require('../models');
const { Op } = require('sequelize');

exports.getAllMedia = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { search, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
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

    const { count, rows: media } = await Media.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    res.json({
      media,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createMedia = async (req, res) => {
  try {
    const { name, url: linkUrl } = req.body;
    
    let url = linkUrl || '';
    let type = 'link';

    if (req.file) {
      url = `/uploads/images/${req.file.filename}`;
      type = 'upload';
    }

    if (!url) {
        return res.status(400).json({ message: 'URL or File is required' });
    }

    const media = await Media.create({ 
      name: name || (req.file ? req.file.originalname : 'Unnamed'), 
      url, 
      type 
    });
    
    res.status(201).json(media);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findByPk(req.params.id);
    if (!media) return res.status(404).json({ message: 'Media not found' });
    
    await media.destroy();
    res.json({ message: 'Media deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
