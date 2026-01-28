const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MediaType = sequelize.define('MediaType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: "uq_media_type_name"
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = MediaType;
