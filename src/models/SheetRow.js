const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SheetRow = sequelize.define(
  "SheetRow",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    sheet_id: { type: DataTypes.INTEGER, allowNull: false },

    // có thể thêm mã dòng / ghi chú nếu muốn
    note: { type: DataTypes.STRING(255), allowNull: true },

    order_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

    created_by: { type: DataTypes.INTEGER, allowNull: false },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "sheet_rows",
    timestamps: true,
    underscored: true,
  }
);

module.exports = SheetRow;