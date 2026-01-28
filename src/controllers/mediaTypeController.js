const { MediaType } = require('../models');
const { Op } = require('sequelize');

exports.getAllMediaTypes = async (req, res) => {
  try {
    const { search } = req.query;
    let where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    const mediaTypes = await MediaType.findAll({
      where,
      order: [['name', 'ASC']]
    });
    res.json(mediaTypes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createMediaType = async (req, res) => {
  try {
    const { name, slug } = req.body;
    const mediaType = await MediaType.create({ name, slug });
    res.status(201).json(mediaType);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateMediaType = async (req, res) => {
  try {
    const { name, slug } = req.body;
    const mediaType = await MediaType.findByPk(req.params.id);
    if (!mediaType) return res.status(404).json({ message: 'Media Type not found' });
    mediaType.name = name || mediaType.name;
    mediaType.slug = slug || mediaType.slug;
    await mediaType.save();
    res.json(mediaType);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteMediaType = async (req, res) => {
  try {
    const mediaType = await MediaType.findByPk(req.params.id);
    if (!mediaType) return res.status(404).json({ message: 'Media Type not found' });
    await mediaType.destroy();
    res.json({ message: 'Media Type deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
