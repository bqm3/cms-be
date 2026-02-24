const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SheetCell = sequelize.define(
  "SheetCell",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    sheet_row_id: { type: DataTypes.INTEGER, allowNull: false },
    sheet_column_id: { type: DataTypes.INTEGER, allowNull: false },

    // lưu text chung (đơn giản nhất)
    value: { type: DataTypes.TEXT, allowNull: true },

    // nếu muốn sort/filter theo số dễ hơn, thêm numeric_value
    numeric_value: { type: DataTypes.DECIMAL(18, 2), allowNull: true },

    // nếu muốn lưu thêm json (vd: dropdown)
    meta: { type: DataTypes.JSON, allowNull: true },
  },
  {
    tableName: "sheet_cells",
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ["sheet_row_id", "sheet_column_id"] }, // 1 ô duy nhất/1 cột/1 dòng
    ],
  }
);

module.exports = SheetCell;