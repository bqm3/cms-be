const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserSheetPermission = sequelize.define('UserSheetPermission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sheet_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'sheet_id']
    }
  ]
});

module.exports = UserSheetPermission;
