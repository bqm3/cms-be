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
