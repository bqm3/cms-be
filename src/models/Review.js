const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Review = sequelize.define(
  "Review",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: "uq_review_slug",
    },
    content: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    img_bg: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    meta_title: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    meta_keyword: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    meta_description: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    meta_override: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_deleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "reviews",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = Review;
