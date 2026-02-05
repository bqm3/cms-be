// routes/sitemap.js
const express = require("express");
const router = express.Router();
const zlib = require("zlib");

// helper escape xml
function escXml(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toIsoDate(d) {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

module.exports = function sitemapRouter(db, opts = {}) {
  const {
    // ✅ Nhớ để full https://...
    siteUrl = process.env.SITE_URL || "https://globalpromotionllc.com",
    enableGzip = true,
    maxUrls = 50000,
    cacheSeconds = 300,
  } = opts;

  router.get("/sitemap.xml", async (req, res, next) => {
    try {
      // ✅ nếu SITE_URL không set thì fallback host runtime
      const origin =
        siteUrl ||
        `${req.protocol}://${req.get("x-forwarded-host") || req.get("host")}`;

      // ====== Query DB (đúng schema của bạn) ======
      // posts: chỉ lấy bài public
      // - is_deleted = 0
      // - is_hidden = 0 (false)
      // - is_approved = 1 (true)
      const [posts] = await db.query(
        `
        SELECT slug, updated_at
        FROM posts
        WHERE is_deleted = 0
          AND (is_hidden = 0 OR is_hidden IS NULL)
          AND (is_approved = 1 OR is_approved IS NULL)
          AND slug IS NOT NULL AND slug <> ''
        ORDER BY updated_at DESC
        LIMIT ?
        `,
        [maxUrls]
      );

      const [cats] = await db.query(
        `
        SELECT slug, updated_at
        FROM categories
        WHERE is_deleted = 0
          AND slug IS NOT NULL AND slug <> ''
        ORDER BY updated_at DESC
        LIMIT ?
        `,
        [maxUrls]
      );

      // ====== Build url list ======
      const urls = [];

      // homepage
      urls.push({
        loc: `${origin}/`,
        changefreq: "daily",
        priority: "1.0",
      });

      // categories (tuỳ route FE của bạn)
      // nếu category page của bạn là /category/:slug thì giữ như này
      for (const c of cats) {
        urls.push({
          loc: `${origin}/category/${encodeURIComponent(c.slug)}`,
          lastmod: toIsoDate(c.updated_at),
          changefreq: "weekly",
          priority: "0.7",
        });
      }

      // posts detail theo đúng route bạn đưa: /site/:slug
      for (const p of posts) {
        urls.push({
          loc: `${origin}/site/${encodeURIComponent(p.slug)}`,
          lastmod: toIsoDate(p.updated_at),
          changefreq: "weekly",
          priority: "0.8",
        });
      }

      // ====== XML ======
      const body =
        `<?xml version="1.0" encoding="UTF-8"?>` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
        urls
          .map((u) => {
            const lastmod = u.lastmod
              ? `<lastmod>${escXml(u.lastmod)}</lastmod>`
              : "";
            const changefreq = u.changefreq
              ? `<changefreq>${escXml(u.changefreq)}</changefreq>`
              : "";
            const priority = u.priority
              ? `<priority>${escXml(u.priority)}</priority>`
              : "";

            return (
              `<url>` +
              `<loc>${escXml(u.loc)}</loc>` +
              lastmod +
              changefreq +
              priority +
              `</url>`
            );
          })
          .join("") +
        `</urlset>`;

      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", `public, max-age=${cacheSeconds}`);

      // gzip
      if (enableGzip && /\bgzip\b/.test(req.headers["accept-encoding"] || "")) {
        res.setHeader("Content-Encoding", "gzip");
        return res.end(zlib.gzipSync(body));
      }

      return res.send(body);
    } catch (err) {
      return next(err);
    }
  });

  return router;
};
