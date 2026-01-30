const sequelize = require('../config/db');
const User = require('./User');
const Post = require('./Post');
const Category = require('./Category');
const ParentCategory = require('./ParentCategory');
const Media = require('./Media');
const MediaType = require('./MediaType');
const Template = require('./Template');

// User - Post associations
Post.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
Post.belongsTo(User, { as: 'updater', foreignKey: 'updated_by' });

// Category - ParentCategory associations
Category.belongsTo(ParentCategory, { foreignKey: 'parent_id', as: 'parent' });
ParentCategory.hasMany(Category, { foreignKey: 'parent_id', as: 'subcategories' });

// Category - Post associations
Post.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Post, { foreignKey: 'category_id' });

// Category - Media associations
Media.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Media, { foreignKey: 'category_id', as: 'media' });

// MediaType - Media associations
Media.belongsTo(MediaType, { foreignKey: 'media_type_id', as: 'mediaType' });
MediaType.hasMany(Media, { foreignKey: 'media_type_id', as: 'media' });

// Template associations
Template.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });
Template.belongsTo(User, { as: 'updater', foreignKey: 'updated_by' });
Template.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Template, { foreignKey: 'category_id' });

module.exports = {
  sequelize,
  User,
  Post,
  Category,
  ParentCategory,
  Media,
  MediaType,
  Template
};
