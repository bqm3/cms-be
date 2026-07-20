const { DataTypes, Op } = require("sequelize");
const sequelize = require("../config/db");
const slugify = require("../utils/slugify");

const Post = sequelize.define(
  "Post",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sequence_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    meta_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    meta_keyword: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    meta_description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    meta_override: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    post_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
   
    content: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_hidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    category_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    topic_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: "uq_post_slug",
    },
    is_deleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_hot: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeValidate: async (post) => {
        // Generate slug if title is provided but slug is not
        if (post.title && (!post.slug || post.slug.trim() === "")) {
          post.slug = slugify(post.title);
        }

        // Ensure slug is unique
        if (post.slug) {
          let baseSlug = post.slug;
          let slug = baseSlug;
          let count = 1;

          while (true) {
            const existing = await Post.findOne({
              where: {
                slug: slug,
                id: { [Op.ne]: post.id || 0 },
              },
            });
            if (!existing) break;
            slug = `${baseSlug}-${count}`;
            count++;
          }
          post.slug = slug;
        }
      },
      beforeUpdate: async (post) => {
        // If slug is explicitly changed
        if (post.changed("slug") && post.slug) {
          const existing = await Post.findOne({
            where: {
              slug: post.slug,
              id: { [Op.ne]: post.id },
            },
          });
          if (existing) {
            throw new Error("Slug đã tồn tại, vui lòng chọn slug khác");
          }
        }
        // If title is changed and slug is empty
        else if (post.changed("title") && !post.slug) {
          let baseSlug = slugify(post.title);
          let slug = baseSlug;
          let count = 1;
          while (true) {
            const existing = await Post.findOne({
              where: {
                slug: slug,
                id: { [Op.ne]: post.id },
              },
            });
            if (!existing) break;
            slug = `${baseSlug}-${count}`;
            count++;
          }
          post.slug = slug;
        }
      },
    },
  },
);

module.exports = Post;
