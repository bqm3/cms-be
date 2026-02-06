const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { Op } = require("sequelize");
const slugify = require("../utils/slugify");

const ParentCategory = sequelize.define(
  "ParentCategory",
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
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
      beforeValidate: async (pCat) => {
        // Generate slug if name is provided but slug is not
        if (pCat.name && (!pCat.slug || pCat.slug.trim() === "")) {
          pCat.slug = slugify(pCat.name);
        }

        // Ensure slug is unique
        if (pCat.slug) {
          let baseSlug = pCat.slug;
          let slug = baseSlug;
          let count = 1;

          while (true) {
            const existing = await ParentCategory.findOne({
              where: {
                slug: slug,
                id: { [Op.ne]: pCat.id || 0 },
              },
            });
            if (!existing) break;
            slug = `${baseSlug}-${count}`;
            count++;
          }
          pCat.slug = slug;
        }
      },
      beforeUpdate: async (pCat) => {
        // If slug is explicitly changed or name is changed while slug is empty
        if (pCat.changed("slug") || (pCat.changed("name") && !pCat.slug)) {
          let baseSlug = pCat.slug || slugify(pCat.name);
          let slug = baseSlug;
          let count = 1;
          while (true) {
            const existing = await ParentCategory.findOne({
              where: {
                slug: slug,
                id: { [Op.ne]: pCat.id },
              },
            });
            if (!existing) break;
            slug = `${baseSlug}-${count}`;
            count++;
          }
          pCat.slug = slug;
        }
      },
    },
  },
);

module.exports = ParentCategory;
