const sequelize = require("../config/db");
const User = require("./User");
const Post = require("./Post");
const Category = require("./Category");
const ParentCategory = require("./ParentCategory");
const Media = require("./Media");
const MediaType = require("./MediaType");
const Template = require("./Template");
const Sheet = require("./Sheet");
const SheetColumn = require("./SheetColumn");
const SheetRow = require("./SheetRow");
const SheetCell = require("./SheetCell");
const FooterLink = require("./FooterLink");
const PostLink = require("./PostLink");
const UserSheetPermission = require("./UserSheetPermission");
const Review = require("./Review");

// User - Post associations
Post.belongsTo(User, { as: "creator", foreignKey: "created_by" });
Post.belongsTo(User, { as: "updater", foreignKey: "updated_by" });

// Category - ParentCategory associations
Category.belongsTo(ParentCategory, { foreignKey: "parent_id", as: "parent" });
ParentCategory.hasMany(Category, { foreignKey: "parent_id", as: "subcategories" });

// Category - Post associations
Post.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Category.hasMany(Post, { foreignKey: "category_id" });

// Post - PostLink associations
Post.hasMany(PostLink, { foreignKey: "post_id", as: "links" });
PostLink.belongsTo(Post, { foreignKey: "post_id", as: "post" });

// Category - Media associations
Media.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Category.hasMany(Media, { foreignKey: "category_id", as: "media" });

// MediaType - Media associations
Media.belongsTo(MediaType, { foreignKey: "media_type_id", as: "mediaType" });
MediaType.hasMany(Media, { foreignKey: "media_type_id", as: "media" });

// Template associations
Template.belongsTo(User, { as: "creator", foreignKey: "created_by" });
Template.belongsTo(User, { as: "updater", foreignKey: "updated_by" });
Template.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Category.hasMany(Template, { foreignKey: "category_id" });

// Sheet associations
Sheet.belongsTo(User, { as: "creator", foreignKey: "created_by" });
Sheet.belongsTo(User, { as: "updater", foreignKey: "updated_by" });

Sheet.hasMany(SheetColumn, { foreignKey: "sheet_id", as: "columns" });
SheetColumn.belongsTo(Sheet, { foreignKey: "sheet_id", as: "sheet" });

Sheet.hasMany(SheetRow, { foreignKey: "sheet_id", as: "rows" });
SheetRow.belongsTo(Sheet, { foreignKey: "sheet_id", as: "sheet" });

// Row - Cell - Column
SheetRow.hasMany(SheetCell, { foreignKey: "sheet_row_id", as: "cells" });
SheetCell.belongsTo(SheetRow, { foreignKey: "sheet_row_id", as: "row" });

SheetColumn.hasMany(SheetCell, { foreignKey: "sheet_column_id", as: "cells" });
SheetCell.belongsTo(SheetColumn, { foreignKey: "sheet_column_id", as: "column" });

// User - Sheet permissions
User.hasMany(UserSheetPermission, { foreignKey: "user_id", as: "sheetPermissions" });
UserSheetPermission.belongsTo(User, { foreignKey: "user_id", as: "user" });

Sheet.hasMany(UserSheetPermission, { foreignKey: "sheet_id", as: "userPermissions" });
UserSheetPermission.belongsTo(Sheet, { foreignKey: "sheet_id", as: "sheet" });

module.exports = {
  sequelize,
  User,
  Post,
  PostLink,
  Category,
  ParentCategory,
  Media,
  MediaType,
  Template,
  Sheet,
  SheetColumn,
  SheetRow,
  SheetCell,
  FooterLink,
  Review,
  UserSheetPermission,
};
