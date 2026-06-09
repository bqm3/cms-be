const { Post, sequelize } = require("../src/models");

async function updatePostSlugs() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    // Fetch all posts (including deleted ones, to ensure we resolve conflicts correctly)
    const posts = await Post.findAll();
    console.log(`Fetched ${posts.length} posts from database.`);

    // Build set of existing slugs to manage conflicts
    const existingSlugs = new Set();
    for (const post of posts) {
      if (post.slug) {
        existingSlugs.add(post.slug);
      }
    }

    let updatedCount = 0;
    const regex = /-\d{6}$/;

    for (const post of posts) {
      if (!post.slug) continue;

      if (regex.test(post.slug)) {
        const baseSlug = post.slug.replace(regex, "");
        let finalSlug = baseSlug;

        // Resolve conflict if the baseSlug already exists in our set
        // (excluding the current post's original slug)
        if (existingSlugs.has(finalSlug) && finalSlug !== post.slug) {
          let counter = 1;
          while (existingSlugs.has(`${baseSlug}-${counter}`)) {
            counter++;
          }
          finalSlug = `${baseSlug}-${counter}`;
        }

        console.log(`Post ID ${post.id}: "${post.slug}" ➔ "${finalSlug}"`);

        // Remove old slug from Set and add new one
        existingSlugs.delete(post.slug);
        existingSlugs.add(finalSlug);

        // Update the record
        post.slug = finalSlug;
        await post.save();
        updatedCount++;
      }
    }

    console.log(`\n✨ Completed slug updates. Total updated posts: ${updatedCount}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error running slug update script:", error);
    process.exit(1);
  }
}

updatePostSlugs();
