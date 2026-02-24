const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SheetColumn = sequelize.define(
  "SheetColumn",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    sheet_id: { type: DataTypes.INTEGER, allowNull: false },

    // tên cột hiển thị: "Dự án", "Tổng tiền", "Còn lại"
    title: { type: DataTypes.STRING(255), allowNull: false },

    // key để dùng nội bộ (optional): "du_an", "tong_tien"
    key: { type: DataTypes.STRING(255), allowNull: true },

    // kiểu dữ liệu (để validate): text/number/currency/date
    data_type: {
      type: DataTypes.ENUM("text", "number", "currency", "date"),
      allowNull: false,
      defaultValue: "text",
    },

    // thứ tự cột
    order_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

    required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

    created_by: { type: DataTypes.INTEGER, allowNull: false },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "sheet_columns",
    timestamps: true,
    underscored: true,
  }
);

module.exports = SheetColumn;