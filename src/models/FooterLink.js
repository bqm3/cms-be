const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const FooterLink = sequelize.define(
  "FooterLink",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("social", "bottom"),
      defaultValue: "bottom",
    },
    href: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "#",
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "footer_links",
    timestamps: true,
  },
);

module.exports = FooterLink;
