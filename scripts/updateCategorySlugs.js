const { Category, ParentCategory, sequelize } = require("../src/models");
const slugify = require("../src/utils/slugify");

async function updateSlugs() {
  try {
    await sequelize.authenticate();
    console.log("Connected to database.");

    console.log("Starting slug update for Categories...");
    const categories = await Category.findAll();
    let updatedCatCount = 0;
    for (const cat of categories) {
      if (!cat.slug || cat.slug.trim() === "") {
        cat.slug = slugify(cat.name);
        await cat.save();
        updatedCatCount++;
        console.log(`Updated category: "${cat.name}" -> "${cat.slug}"`);
      }
    }
    console.log(`Finished updating Categories. Total updated: ${updatedCatCount}`);

    console.log("Starting slug update for ParentCategories...");
    const parentCategories = await ParentCategory.findAll();
    let updatedParentCount = 0;
    for (const pCat of parentCategories) {
      if (!pCat.slug || pCat.slug.trim() === "") {
        pCat.slug = slugify(pCat.name);
        await pCat.save();
        updatedParentCount++;
        console.log(`Updated parent category: "${pCat.name}" -> "${pCat.slug}"`);
      }
    }
    console.log(`Finished updating ParentCategories. Total updated: ${updatedParentCount}`);

    console.log("Slug update completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error updating slugs:", error);
    process.exit(1);
  }
}

updateSlugs();


async function fixConstraints() {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối database thành công.");

    const queryInterface = sequelize.getQueryInterface();
    const dbName = sequelize.getDatabaseName();
    const dialect = sequelize.getDialect();

    console.log(`ℹ️ Đang chạy trên database: ${dbName} (Dialect: ${dialect})`);

    // --- Xử lý cho bảng Categories ---
    console.log("\n--- Bảng Categories ---");
    try {
      // Thử xóa các index thường gặp nếy chúng tồn tại
      const indexes = ['uq_category_name', 'name', 'name_unique', 'Categories_name_unique'];
      for (const idx of indexes) {
        try {
          await queryInterface.removeIndex("Categories", idx);
          console.log(`✅ Đã xóa index '${idx}' khỏi bảng Categories.`);
        } catch (e) {
          // Bỏ qua nếu index không tồn tại
        }
      }
    } catch (error) {
      console.error("❌ Lỗi khi xử lý bảng Categories:", error.message);
    }

    // --- Xử lý cho bảng ParentCategories ---
    console.log("\n--- Bảng ParentCategories ---");
    try {
      const indexes = ['uq_parent_category_name', 'name', 'name_unique', 'ParentCategories_name_unique'];
      for (const idx of indexes) {
        try {
          await queryInterface.removeIndex("ParentCategories", idx);
          console.log(`✅ Đã xóa index '${idx}' khỏi bảng ParentCategories.`);
        } catch (e) {
          // Bỏ qua nếu không tồn tại
        }
      }
    } catch (error) {
      console.error("❌ Lỗi khi xử lý bảng ParentCategories:", error.message);
    }

    console.log("\n✨ Hoàn tất việc gỡ bỏ ràng buộc Unique cho trường 'name'.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi nghiêm trọng:", error);
    process.exit(1);
  }
}

fixConstraints();