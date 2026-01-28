const sequelize = require('../config/db');
const User = require('./User');
const Post = require('./Post');
const Category = require('./Category');
const Media = require('./Media');
const MediaType = require('./MediaType');

// User - Post associations
Post.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
Post.belongsTo(User, { as: 'updater', foreignKey: 'updated_by' });

// Category - Post associations
Post.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Post, { foreignKey: 'category_id' });

// Category - Media associations
Media.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Media, { foreignKey: 'category_id', as: 'media' });

// MediaType - Media associations
Media.belongsTo(MediaType, { foreignKey: 'media_type_id', as: 'mediaType' });
MediaType.hasMany(Media, { foreignKey: 'media_type_id', as: 'media' });

module.exports = {
  sequelize,
  User,
  Post,
  Category,
  Media,
  MediaType
};
