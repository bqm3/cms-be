const { Post, sequelize } = require("../src/models");

async function updatePostSlugs() {
  const transaction = await sequelize.transaction();
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    const posts = await Post.findAll({ transaction });
    console.log(`Fetched ${posts.length} posts from database.`);

    const regex = /(-\d+)+$/;
    const toUpdate = posts.filter(p => p.slug && regex.test(p.slug));

    // ===== BƯỚC 1: Preview =====
    console.log("\n===== 📋 PREVIEW (chưa update) =====");
    for (const post of toUpdate) {
      const finalSlug = post.slug.replace(regex, "");
      const deletedLabel = post.is_deleted ? `🗑️  deleted` : `✅ active`;
      console.log(`Post ID ${post.id} [${deletedLabel}]: "${post.slug}" ➔ "${finalSlug}"`);
    }

    console.log(`\nTổng cần update: ${toUpdate.length} posts`);
    console.log("👉 Chạy lại với --confirm để thực sự update DB");

    if (!process.argv.includes("--confirm")) {
      await transaction.rollback();
      process.exit(0);
    }

    // ===== BƯỚC 2: Update trong transaction =====
    console.log("\n===== ✍️  UPDATING =====");
    let updatedCount = 0;

    for (const post of toUpdate) {
      const finalSlug = post.slug.replace(regex, "");
      const deletedLabel = post.is_deleted ? `🗑️  deleted` : `✅ active`;

      post.slug = finalSlug;
      await post.save({ transaction });

      console.log(`✅ Post ID ${post.id} [${deletedLabel}]: "${post.slug}" ➔ "${finalSlug}"`);
      updatedCount++;
    }

    await transaction.commit();
    console.log(`\n✨ Done. Updated: ${updatedCount}`);
    process.exit(0);
  } catch (error) {
    await transaction.rollback();

    // Hiển thị lỗi unique constraint rõ ràng
    if (error.name === "SequelizeUniqueConstraintError") {
      const slug = error.fields?.slug || error.fields?.uq_post_slug || "unknown";
      console.error(`\n❌ ROLLBACK! Trùng slug: "${slug}"`);
      console.error(`   └─ Có 2 posts cùng strip về slug này, cần xử lý thủ công.`);

      // Tìm và hiển thị các post bị trùng
      const conflictPosts = await Post.findAll({ where: { slug } });
      console.error(`   └─ Các post liên quan:`);
      conflictPosts.forEach(p =>
        console.error(`      - Post ID ${p.id} [is_deleted=${p.is_deleted}]: "${p.slug}"`)
      );
    } else {
      console.error("❌ Error:", error.message);
    }

    process.exit(1);
  }
}

updatePostSlugs();