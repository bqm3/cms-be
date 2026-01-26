const sequelize = require('../config/db');
const User = require('./User');
const Post = require('./Post');
const Category = require('./Category');

// User - Post associations
Post.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
Post.belongsTo(User, { as: 'updater', foreignKey: 'updated_by' });

// Category - Post associations
Post.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Post, { foreignKey: 'category_id' });

module.exports = {
  sequelize,
  User,
  Post,
  Category
};
