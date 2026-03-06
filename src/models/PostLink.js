const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PostLink = sequelize.define(
  "PostLink",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Posts",
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    href: {
      type: DataTypes.STRING,
      allowNull: false,
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
  },
);

module.exports = PostLink;
