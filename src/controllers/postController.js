const { Post, User, Category, ParentCategory } = require("../models");
const { Op } = require("sequelize");
const crypto = require("crypto");
const slugify = require("../utils/slugify");

function generateSlug(title) {
  const baseSlug = slugify(title, { lower: true, strict: true });
  const random = crypto.randomInt(100000, 1000000); // 6 số
  return `${baseSlug}-${random}`;
}

function buildAutoMetaFromTitle(titleRaw) {
  const t = String(titleRaw || "").trim();
  if (!t) return { meta_title: null, meta_keyword: null, meta_description: null };

  const meta_title = `${t} promotion latest`;

  const meta_description =
    `Use Globalpromotionllc.com to find the latest discount codes and best deals when shopping ` +
    `online at ${t} through Globalpromotionllc.com. Save more on every order with our verified discount codes, ` +
    `food coupons, and cashback offers.`;

  // keyword: Title, Title promotion, Title promotion newest
  const meta_keyword = `${t}, ${t} promotion, ${t} promotion newest`;

  return { meta_title, meta_keyword, meta_description };
}

function parseBool(v) {
  return v === true || v === "true" || v === "1" || v === 1;
}

// Public: Get all approved posts
exports.getPublicPosts = async (req, res) => {
  try {
    const { sort, category, parentCategory, search, page = 1, limit = 10 } = req.query;

    // sort
    let order = [["sequence_number", "ASC"]];
    if (sort) {
      const [field, directionRaw] = String(sort).split(":");
      const direction = (directionRaw || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

      if (["view_count", "sequence_number", "created_at"].includes(field)) {
        order = [[field, direction]];
      }
    }

    // where
    const where = {
      is_approved: true,
      is_deleted: 0,
      is_hidden: false,
    };

    if (category) {
      if (/^\d+$/.test(category)) {
        where.category_id = category;
      } else {
        const cat = await Category.findOne({ where: { slug: category, is_deleted: 0 } });
        if (cat) where.category_id = cat.id;
        else where.category_id = -1; // Not found
      }
    }

    if (search && String(search).trim()) {
      const s = String(search).trim();
      where[Op.or] = [{ title: { [Op.like]: `%${s}%` } }, { post_title: { [Op.like]: `%${s}%` } }, { slug: { [Op.like]: `%${s}%` } }];
    }

    // pagination
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 8, 1), 50);
    const offset = (pageNum - 1) * limitNum;

    // include
    let parentCategoryId = parentCategory;
    if (parentCategory && !/^\d+$/.test(parentCategory)) {
      const pc = await ParentCategory.findOne({ where: { slug: parentCategory, is_deleted: 0 } });
      parentCategoryId = pc ? pc.id : -1;
    }

    const include = [
      {
        model: User,
        as: "creator",
        attributes: ["username"],
      },
      {
        model: Category,
        as: "category",
        attributes: ["id", "name", "parent_id", "slug"],
        ...(parentCategoryId ? { where: { parent_id: parentCategoryId }, required: true } : {}),
      },
    ];

    const { count, rows } = await Post.findAndCountAll({
      where,
      order,
      limit: limitNum,
      offset,
      attributes: {
        exclude: ["content"],
      },

      include,
      distinct: true,
    });

    return res.json({
      posts: rows,
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

// Public/User: Get single post and increment view
exports.getPostDetail = async (req, res) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);

    const post = await Post.findOne({
      where: {
        ...(isNumeric ? { [Op.or]: [{ id: identifier }, { slug: identifier }] } : { slug: identifier }),
        is_deleted: 0,
      },
      include: [
        { model: User, as: "creator", attributes: ["username"] },
        { model: Category, as: "category", attributes: ["name"] },
      ],
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    // Increment view count ONLY if in preview mode (as requested)
    if (req.query.preview === "true") {
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
    const {
      sequence_number,
      title,
      content,
      category_id,
      topic_name,
      view_count,
      is_hidden,

      // ✅ meta fields
      meta_title,
      meta_keyword,
      meta_description,
      meta_override,
    } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const cleanTitle = (title ?? "").trim();
    if (!cleanTitle) {
      return res.status(400).json({ message: "Tiêu đề là bắt buộc" });
    }

    // category_id nullable
    let catId = null;
    if (category_id !== undefined && category_id !== null && String(category_id).trim() !== "") {
      catId = Number(category_id);
      if (Number.isNaN(catId)) {
        return res.status(400).json({ message: "Danh mục không hợp lệ" });
      }
    }

    const logo = req.file ? `/uploads/${req.file.filename}` : null;
    const slug = await generateSlug(cleanTitle);

    const override = parseBool(meta_override);

    const autoMeta = buildAutoMetaFromTitle(cleanTitle);
    const finalMeta = override
      ? {
          meta_title: (meta_title ?? "").trim() || null,
          meta_keyword: (meta_keyword ?? "").trim() || null,
          meta_description: (meta_description ?? "").trim() || null,
          meta_override: true,
        }
      : {
          ...autoMeta,
          meta_override: false,
        };

    const post = await Post.create({
      sequence_number: Number(sequence_number) || 0,
      title: cleanTitle,
      content: content ?? "",
      category_id: catId,
      topic_name: (topic_name ?? "").trim() || null,
      view_count: Number(view_count) || 0,
      logo,
      slug,

      // ✅ hidden
      is_hidden: parseBool(is_hidden),

      // ✅ meta
      ...finalMeta,

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
    const { category, parentCategory, topic, sort, search, startDate, endDate } = req.query;

    let where = { is_deleted: 0 };

    // Role based filtering
    if (req.user.role !== "admin") {
      where.created_by = req.user.id;
    }

    if (category) where.category_id = category;
    if (topic) where.topic_name = topic;

    let categoryWhere = {};
    if (parentCategory) {
      categoryWhere.parent_id = parentCategory;
    }

    if (search) {
      where[Op.or] = [{ title: { [Op.like]: `%${search}%` } }, { post_title: { [Op.like]: `%${search}%` } }];
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

    let order = [["created_at", "DESC"]];
    if (sort) {
      const [field, directionRaw] = String(sort).split(":");
      const direction = (directionRaw || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";
      order = [[field, direction]];
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: posts } = await Post.findAndCountAll({
      where,
      order,
      limit,
      offset,

      // 🔥 BỎ content ở đây
      attributes: {
        exclude: ["content"],
      },

      include: [
        { model: User, as: "creator", attributes: ["username"] },
        { model: User, as: "updater", attributes: ["username"] },
        {
          model: Category,
          as: "category",
          attributes: ["name", "parent_id"],
          where: Object.keys(categoryWhere).length > 0 ? categoryWhere : undefined,
          required: Object.keys(categoryWhere).length > 0,
        },
      ],
      distinct: true,
    });

    res.json({
      posts,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Approve post
exports.approvePost = async (req, res) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.id, is_deleted: 0 } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.is_approved = true;
    post.updated_by = req.user.id;
    await post.save();

    res.json({ message: "Post approved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin/Owner: Copy post
exports.copyPost = async (req, res) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.id, is_deleted: 0 } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check permission
    if (req.user.role !== "admin" && post.created_by !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const newTitle = `${post.title}`;
    const newSlug = await generateSlug(newTitle);

    const duplicatedPost = await Post.create({
      sequence_number: post.sequence_number,
      title: newTitle,
      post_title: post.post_title,
      content: post.content,
      category_id: post.category_id,
      topic_name: post.topic_name,
      view_count: 0,
      logo: post.logo,
      slug: newSlug,
      description: post.description,

      // ✅ copy SEO meta
      meta_override: !!post.meta_override,
      meta_title: post.meta_title || "",
      meta_keyword: post.meta_keyword || "",
      meta_description: post.meta_description || "",

      created_by: req.user.id,
      is_approved: req.user.role === "admin",
    });

    return res.status(201).json(duplicatedPost);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Admin/Owner: Update post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.id, is_deleted: 0 } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (req.user.role !== "admin" && post.created_by !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const {
      sequence_number,
      title,
      content,
      category_id,
      topic_name,
      is_approved,
      view_count,
      is_hidden,

      // ✅ meta
      meta_title,
      meta_keyword,
      meta_description,
      meta_override,
    } = req.body;

    if (req.file) {
      post.logo = `/uploads/${req.file.filename}`;
    }

    if (sequence_number !== undefined) post.sequence_number = sequence_number;
    if (view_count !== undefined) post.view_count = view_count;

    if (is_hidden !== undefined) {
      post.is_hidden = parseBool(is_hidden);
    }

    // title/content/category/topic
    if (title !== undefined) post.title = String(title || "").trim();
    if (content !== undefined) post.content = content;
    if (category_id !== undefined) post.category_id = category_id || null;
    if (topic_name !== undefined) post.topic_name = (topic_name ?? "").trim() || null;

    // ✅ meta logic
    if (meta_override !== undefined) {
      const override = parseBool(meta_override);

      if (override) {
        post.meta_title = (meta_title ?? "").trim() || null;
        post.meta_keyword = (meta_keyword ?? "").trim() || null;
        post.meta_description = (meta_description ?? "").trim() || null;
        post.meta_override = true;
      } else {
        // auto-generate from latest title
        const baseTitle = String(post.title || "").trim();
        const autoMeta = buildAutoMetaFromTitle(baseTitle);
        post.meta_title = autoMeta.meta_title;
        post.meta_keyword = autoMeta.meta_keyword;
        post.meta_description = autoMeta.meta_description;
        post.meta_override = false;
      }
    }

    post.updated_by = req.user.id;

    if (req.user.role === "admin" && is_approved !== undefined) {
      post.is_approved = is_approved;
    } else if (req.user.role !== "admin") {
      post.is_approved = false;
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
    const post = await Post.findOne({ where: { id: req.params.id, is_deleted: 0 } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.is_deleted = 1;
    await post.save();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Toggle hidden
exports.setHiddenPost = async (req, res) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.id, is_deleted: 0 } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    // chỉ admin được ẩn/hiện (đúng với UI của bạn)
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const raw = req.body?.is_hidden;
    const isHidden = raw === true || raw === "true" || raw === 1 || raw === "1";

    post.is_hidden = isHidden;
    post.updated_by = req.user.id;
    await post.save();

    res.json({ message: "Updated", is_hidden: post.is_hidden });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
