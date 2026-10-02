const express = require("express");
const zlib = require("zlib");
const { Op } = require("sequelize");

const Post = require("../models/Post");
const Category = require("../models/Category");
const ParentCategory = require("../models/ParentCategory");
const Review = require("../models/Review");
const { canonicalSiteUrl } = require("../config/site");

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

module.exports = function sitemapRouter(opts = {}) {
  const router = express.Router();

  const {
    siteUrl = canonicalSiteUrl,
    enableGzip = true,
    maxUrls = 50000,
    cacheSeconds = 300,
  } = opts;

  router.get("/sitemap.xml", async (req, res, next) => {
    try {
      const origin =
        siteUrl ||
        `${req.protocol}://${req.get("x-forwarded-host") || req.get("host")}`;

      const posts = await Post.findAll({
        attributes: ["slug", "updated_at"],
        where: {
          is_approved: true,
          is_deleted: 0,
          is_hidden: false,
          [Op.and]: [
            { slug: { [Op.ne]: null } },
            { slug: { [Op.ne]: "" } },
          ],
        },
        order: [["updated_at", "DESC"]],
        limit: Number(maxUrls) || 50000,
        raw: true,
      });

      const parentCats = await ParentCategory.findAll({
        attributes: ["slug", "updated_at"],
        where: {
          is_deleted: 0,
          [Op.and]: [
            { slug: { [Op.ne]: null } },
            { slug: { [Op.ne]: "" } },
          ],
        },
        order: [["updated_at", "DESC"]],
        raw: true,
      });

      const cats = await Category.findAll({
        attributes: ["slug", "updated_at"],
        where: {
          is_deleted: 0,
          [Op.and]: [
            { slug: { [Op.ne]: null } },
            { slug: { [Op.ne]: "" } },
          ],
        },
        order: [["updated_at", "DESC"]],
        limit: Number(maxUrls) || 50000,
        raw: true,
      });

      const reviews = await Review.findAll({
        attributes: ["slug", "updated_at"],
        where: {
          is_deleted: 0,
          [Op.and]: [
            { slug: { [Op.ne]: null } },
            { slug: { [Op.ne]: "" } },
          ],
        },
        order: [["updated_at", "DESC"]],
        raw: true,
      });

      const latestUpdate = posts[0]?.updated_at
        ? toIsoDate(posts[0].updated_at)
        : toIsoDate(new Date());

      const urls = [];

      // Static pages with lastmod
      urls.push({ loc: `${origin}/`, lastmod: latestUpdate });
      urls.push({ loc: `${origin}/category`, lastmod: latestUpdate });
      urls.push({ loc: `${origin}/review`, lastmod: latestUpdate });
      urls.push({ loc: `${origin}/about-us`, lastmod: latestUpdate });
      urls.push({ loc: `${origin}/privacy-policy`, lastmod: latestUpdate });
      urls.push({ loc: `${origin}/terms`, lastmod: latestUpdate });
      urls.push({ loc: `${origin}/contact`, lastmod: latestUpdate });

      // Parent Categories
      for (const pc of parentCats) {
        urls.push({
          loc: `${origin}/category/${encodeURIComponent(pc.slug)}`,
          lastmod: toIsoDate(pc.updated_at),
        });
      }

      // Child Categories
      for (const c of cats) {
        urls.push({
          loc: `${origin}/category/${encodeURIComponent(c.slug)}`,
          lastmod: toIsoDate(c.updated_at),
        });
      }

      // Reviews
      for (const r of reviews) {
        urls.push({
          loc: `${origin}/review/${encodeURIComponent(r.slug)}`,
          lastmod: toIsoDate(r.updated_at),
        });
      }

      // Posts
      for (const p of posts) {
        urls.push({
          loc: `${origin}/${encodeURIComponent(p.slug)}`,
          lastmod: toIsoDate(p.updated_at),
        });
      }

      const body =
        `<?xml version="1.0" encoding="UTF-8"?>` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
        urls
          .map((u) => {
            const lastmod = u.lastmod ? `<lastmod>${escXml(u.lastmod)}</lastmod>` : "";
            return `<url><loc>${escXml(u.loc)}</loc>${lastmod}</url>`;
          })
          .join("") +
        `</urlset>`;

      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", `public, max-age=${cacheSeconds}`);

      if (enableGzip && /\bgzip\b/.test(req.headers["accept-encoding"] || "")) {
        res.setHeader("Content-Encoding", "gzip");
        return res.end(zlib.gzipSync(body));
      }

      return res.send(body);
    } catch (err) {
      console.error("SITEMAP ERROR:", err?.message);
      console.error("SQL:", err?.sql);
      console.error("SQL MESSAGE:", err?.original?.sqlMessage);
      console.error("CODE:", err?.original?.code);
      return next(err);
    }
  });

  return router;
};
