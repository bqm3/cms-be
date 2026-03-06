const { PostLink, Post } = require("../models");

exports.getPostLinks = async (req, res) => {
  try {
    const { postId } = req.params;
    const links = await PostLink.findAll({
      where: { post_id: postId },
      order: [["sequence_number", "ASC"]],
    });
    res.json(links);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPostLink = async (req, res) => {
  try {
    const { post_id, title, href, sequence_number } = req.body;

    const post = await Post.findByPk(post_id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const link = await PostLink.create({
      post_id,
      title,
      href,
      sequence_number: sequence_number || 0,
    });

    res.status(201).json(link);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePostLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, href, sequence_number } = req.body;

    const link = await PostLink.findByPk(id);
    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    if (title !== undefined) link.title = title;
    if (href !== undefined) link.href = href;
    if (sequence_number !== undefined) link.sequence_number = sequence_number;

    await link.save();
    res.json(link);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePostLink = async (req, res) => {
  try {
    const { id } = req.params;
    const link = await PostLink.findByPk(id);
    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    await link.destroy();
    res.json({ message: "Link deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bulkUpdateLinks = async (req, res) => {
  try {
    const { postId } = req.params;
    const { links } = req.body; // Array of { id, title, href, sequence_number }

    // 1. Get current link IDs in database
    const currentLinks = await PostLink.findAll({ where: { post_id: postId } });
    const currentIds = currentLinks.map((l) => l.id);

    // 2. Identify IDs to keep vs delete
    const incomingIds = links.filter((l) => l.id).map((l) => l.id);
    const idsToDelete = currentIds.filter((id) => !incomingIds.includes(id));

    // 3. Delete removed links
    if (idsToDelete.length > 0) {
      await PostLink.destroy({ where: { id: idsToDelete } });
    }

    // 4. Update or Create
    for (const item of links) {
      if (item.id) {
        await PostLink.update(
          { title: item.title, href: item.href, sequence_number: item.sequence_number },
          { where: { id: item.id, post_id: postId } },
        );
      } else {
        await PostLink.create({
          post_id: postId,
          title: item.title,
          href: item.href,
          sequence_number: item.sequence_number || 0,
        });
      }
    }

    const updatedLinks = await PostLink.findAll({
      where: { post_id: postId },
      order: [["sequence_number", "ASC"]],
    });

    res.json(updatedLinks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
