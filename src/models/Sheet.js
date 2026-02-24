const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Sheet = sequelize.define(
  "Sheet",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false }, // ví dụ: "Bảng dự án"
    description: { type: DataTypes.TEXT, allowNull: true },

    created_by: { type: DataTypes.INTEGER, allowNull: false },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "sheets",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Sheet;