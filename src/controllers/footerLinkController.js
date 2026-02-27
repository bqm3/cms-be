const { FooterLink } = require("../models");

exports.getAll = async (req, res) => {
  try {
    const { type } = req.query;
    const where = type ? { type } : {};
    const links = await FooterLink.findAll({
      where,
      order: [["order", "ASC"]],
    });
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAll = async (req, res) => {
  try {
    const links = req.body; // Array of { id, label, href, order }

    for (const link of links) {
      if (link.id) {
        await FooterLink.update(link, { where: { id: link.id } });
      } else {
        await FooterLink.create(link);
      }
    }

    const updatedLinks = await FooterLink.findAll({
      order: [["order", "ASC"]],
    });
    res.json(updatedLinks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const link = await FooterLink.create(req.body);
    res.status(201).json(link);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await FooterLink.destroy({ where: { id: req.params.id } });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
