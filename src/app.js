/* eslint-disable prettier/prettier */
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

// const sequelize = require("./config/db"); // if you only import to init, keep it; otherwise remove
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const mediaTypeRoutes = require("./routes/mediaTypeRoutes");
const parentCategoryRoutes = require("./routes/parentCategoryRoutes");
const templateRoutes = require("./routes/templateRoutes");
const sheetRoutes = require("./routes/sheetRoutes");
const footerLinkRoutes = require("./routes/footerLinkRoutes");
const postLinkRoutes = require("./routes/postLinkRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const featuredDealRoutes = require("./routes/featuredDealRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const sitemapRouter = require("./routes/sitemap");
const {
  canonicalSiteUrl,
  allowedOrigins,
  normalizeOrigin,
} = require("./config/site");

const app = express();

/**
 * CORS:
 * - credentials: true => cannot use Access-Control-Allow-Origin: *
 * - use allowlist + callback
 */
const corsOptions = {
  origin: function (origin, cb) {
    if (!origin) return cb(null, true);
    const normalized = normalizeOrigin(origin);
    const isAllowed = allowedOrigins.includes(normalized);
    if (isAllowed) return cb(null, true);
    return cb(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.set("trust proxy", 1);

app.use(cookieParser());

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/parent-categories", parentCategoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/media-types", mediaTypeRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/sheets", sheetRoutes);
app.use("/api/footer-links", footerLinkRoutes);
app.use("/api/post-links", postLinkRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/featured-deals", featuredDealRoutes);
app.use("/api/banners", bannerRoutes);

// Sitemap
app.use(
  sitemapRouter({
    siteUrl: canonicalSiteUrl,
    enableGzip: true,
  }),
);

// robots.txt
app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send(
    `User-agent: *
Allow: /
Disallow: /login
Disallow: /dashboard
Disallow: /editor/
Disallow: /module/
Disallow: /preview
Disallow: /categories
Disallow: /parent-categories
Disallow: /users
Disallow: /sheets
Disallow: /media
Disallow: /footer-links
Disallow: /reviews
Disallow: /featured-deals
Disallow: /banners
Disallow: /template-dashboard
Disallow: /template-editor/

Sitemap: ${canonicalSiteUrl}/sitemap.xml
`,
  );
});

app.get("/", (req, res) => {
  res.send("CMS API is running...");
});

app.use((err, req, res, next) => {
  console.error("APP ERROR:", err?.message || err);

  const status = err?.status || 500;
  res.status(status).json({
    message: err?.message || "Internal server error",
  });
});

module.exports = app;
