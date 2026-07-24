const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { Op } = require("sequelize");
const slugify = require("../utils/slugify");

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name_vi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    sequence_number: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeValidate: async (category) => {
        // Generate slug if name is provided but slug is not
        if (category.name && (!category.slug || category.slug.trim() === "")) {
          category.slug = slugify(category.name);
        }

        // Ensure slug is unique
        if (category.slug) {
          let baseSlug = category.slug;
          let slug = baseSlug;
          let count = 1;

          while (true) {
            const existing = await Category.findOne({
              where: {
                slug: slug,
                id: { [Op.ne]: category.id || 0 },
              },
            });
            if (!existing) break;
            slug = `${baseSlug}-${count}`;
            count++;
          }
          category.slug = slug;
        }
      },
      beforeUpdate: async (category) => {
        // If slug is explicitly changed or name is changed while slug is empty
        if (category.changed("slug") || (category.changed("name") && !category.slug)) {
          let baseSlug = category.slug || slugify(category.name);
          let slug = baseSlug;
          let count = 1;
          while (true) {
            const existing = await Category.findOne({
              where: {
                slug: slug,
                id: { [Op.ne]: category.id },
              },
            });
            if (!existing) break;
            slug = `${baseSlug}-${count}`;
            count++;
          }
          category.slug = slug;
        }
      },
    },
  },
);

module.exports = Category;
