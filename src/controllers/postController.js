const { Post, User, Category } = require('../models');
const { Op } = require('sequelize');
const slugify = require('../utils/slugify');

async function generateUniqueSlug(title, currentId = null) {
  let slug = slugify(title);
  let uniqueSlug = slug;
  let count = 1;

  while (true) {
    const where = { slug: uniqueSlug };
    if (currentId) {
      where.id = { [Op.ne]: currentId };
    }
    const existingPost = await Post.findOne({ where });
    if (!existingPost) break;
    uniqueSlug = `${slug}-${count}`;
    count++;
  }
  return uniqueSlug;
}

// Public: Get all approved posts
exports.getPublicPosts = async (req, res) => {
  try {
    const { sort, category } = req.query; // sort=view_count:DESC
    let order = [['sequence_number', 'ASC']];
    
    if (sort) {
      const [field, direction] = sort.split(':');
      if (['view_count', 'sequence_number', 'created_at'].includes(field)) {
        order = [[field, direction || 'DESC']];
      }
    }

    let where = { is_approved: true };
    if (category) {
      where.category_id = category;
    }

    const posts = await Post.findAll({
      where,
      order,
      include: [
        { model: User, as: 'creator', attributes: ['username'] },
        { model: Category, as: 'category', attributes: ['name'] }
      ]
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Public/User: Get single post and increment view
exports.getPostDetail = async (req, res) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);
    
    const post = await Post.findOne({
      where: isNumeric ? { [Op.or]: [{ id: identifier }, { slug: identifier }] } : { slug: identifier },
      include: [
        { model: User, as: 'creator', attributes: ['username'] },
        { model: Category, as: 'category', attributes: ['name'] }
      ]
    });

    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Increment view count ONLY if in preview mode (as requested)
    if (req.query.preview === 'true') {
      post.view_count += 1;
      await post.save();
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User: Create post
exports.createPost = async (req, res) => {
  try {
    // multer + form-data => tất cả req.body là string
    const {
      sequence_number,
      title,
      post_title,
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
      return res.status(400).json({ message: "title is required" });
    }

    const catId =
      category_id === undefined || category_id === null || String(category_id).trim() === ""
        ? null
        : Number(category_id);

    if (catId !== null && Number.isNaN(catId)) {
      return res.status(400).json({ message: "category_id must be a number" });
    }

    const logo = req.file ? `/uploads/${req.file.filename}` : null;

    const slug = await generateUniqueSlug(cleanTitle);

    const post = await Post.create({
      sequence_number: sequence_number ? Number(sequence_number) : 0,
      title: cleanTitle,
      post_title: (post_title ?? "").trim() || null,
      content: content ?? "",
      category_id: catId,
      topic_name: (topic_name ?? "").trim() || null,
      view_count: view_count ? Number(view_count) : 0,
      logo,
      slug,
      created_by: req.user.id,
      is_approved: req.user.role === "admin",
    });

    return res.status(201).json(post);
  } catch (err) {
    console.error("CREATE POST ERROR:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};


// Admin/User: Get posts for dashboard (Admin sees all, User sees own)
exports.getAllPostsAdmin = async (req, res) => {
  try {
    const { category, topic, sort, search, startDate, endDate } = req.query;
    
    let where = {};
    
    // Role based filtering
    if (req.user.role !== 'admin') {
      where.created_by = req.user.id;
    }
    
    if (category) where.category_id = category;
    if (topic) where.topic_name = topic;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { post_title: { [Op.like]: `%${search}%` } }
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

    const { count, rows: posts } = await Post.findAndCountAll({
      where,
      order,
      limit,
      offset,
      include: [
        { model: User, as: 'creator', attributes: ['username'] },
        { model: User, as: 'updater', attributes: ['username'] },
        { model: Category, as: 'category', attributes: ['name'] }
      ]
    });

    res.json({
      posts,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Approve post
exports.approvePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.is_approved = true;
    post.updated_by = req.user.id;
    await post.save();

    res.json({ message: 'Post approved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin/Owner: Update post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check permission
    if (req.user.role !== 'admin' && post.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { sequence_number, title, post_title, content, category_id, topic_name, is_approved, slug, view_count } = req.body;
    
    if (req.file) {
      post.logo = `/uploads/${req.file.filename}`;
    }

    if (sequence_number !== undefined) post.sequence_number = sequence_number;
    if (view_count !== undefined) post.view_count = view_count;
    
    // Auto-update slug if title changes and no slug provided, or if slug provided
    if (title && title !== post.title && !slug) {
      post.slug = await generateUniqueSlug(title, post.id);
    } else if (slug) {
      // If user provides a custom slug, we should still ensure it's unique
      post.slug = await generateUniqueSlug(slug, post.id);
    } else if (title && !post.slug) {
      post.slug = await generateUniqueSlug(title, post.id);
    }

    if (title) post.title = title;
    if (post_title) post.post_title = post_title;
    if (content) post.content = content;
    if (category_id) post.category_id = category_id;
    if (topic_name) post.topic_name = topic_name;
    
    post.updated_by = req.user.id;

    if (req.user.role === 'admin' && is_approved !== undefined) {
      post.is_approved = is_approved;
    } else if (req.user.role !== 'admin') {
      post.is_approved = false; // Re-approval needed if user edits
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await post.destroy();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
