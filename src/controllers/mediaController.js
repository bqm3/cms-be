const { Media } = require('../models');

exports.getAllMedia = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: media } = await Media.findAndCountAll({
      order: [['createdAt', 'DESC']],
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
