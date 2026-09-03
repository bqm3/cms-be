const express = require("express");
const zlib = require("zlib");
const { Op } = require("sequelize");

const Post = require("../models/Post");
const Category = require("../models/Category");
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

      const urls = [];

      urls.push({ loc: `${origin}/`, changefreq: "daily", priority: "1.0" });

      for (const c of cats) {
        urls.push({
          loc: `${origin}/category/${encodeURIComponent(c.slug)}`,
          lastmod: toIsoDate(c.updated_at),
          changefreq: "weekly",
          priority: "0.7",
        });
      }

      for (const p of posts) {
        urls.push({
          loc: `${origin}/${encodeURIComponent(p.slug)}`,
          lastmod: toIsoDate(p.updated_at),
          changefreq: "weekly",
          priority: "0.8",
        });
      }

      const body =
        `<?xml version="1.0" encoding="UTF-8"?>` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
        urls
          .map((u) => {
            const lastmod = u.lastmod ? `<lastmod>${escXml(u.lastmod)}</lastmod>` : "";
            const changefreq = u.changefreq ? `<changefreq>${escXml(u.changefreq)}</changefreq>` : "";
            const priority = u.priority ? `<priority>${escXml(u.priority)}</priority>` : "";
            return `<url><loc>${escXml(u.loc)}</loc>${lastmod}${changefreq}${priority}</url>`;
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
