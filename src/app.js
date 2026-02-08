/* eslint-disable prettier/prettier */
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

// const sequelize = require("./config/db"); // nếu bạn chỉ import để init thì giữ, không dùng thì bỏ
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const mediaTypeRoutes = require("./routes/mediaTypeRoutes");
const parentCategoryRoutes = require("./routes/parentCategoryRoutes");
const templateRoutes = require("./routes/templateRoutes");
const sitemapRouter = require("./routes/sitemap");

const app = express();

/**
 * ✅ CORS:
 * - credentials: true => KHÔNG được Access-Control-Allow-Origin: *
 * - dùng allowlist + callback
 */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://172.21.164.1:5173",
  "http://192.168.1.19:5173",
  "https://globalpromotionllc.com",
];

const corsOptions = {
  origin: function (origin, cb) {
    // Cho phép server-to-server/curl/postman (origin undefined)
    if (!origin) return cb(null, true);

    if (allowedOrigins.includes(origin)) return cb(null, true);

    return cb(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Length"],
  optionsSuccessStatus: 200,
};

// ✅ Nếu bạn deploy sau reverse proxy (nginx/cloudflare) thì bật:
app.set("trust proxy", 1);

// ✅ Parse cookies
app.use(cookieParser());

// ✅ CORS + preflight
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ✅ Tăng limit body (tránh lỗi payload lớn ở Express)
// Lưu ý: 413 vẫn có thể đến từ Nginx => cần client_max_body_size ở Nginx nữa.
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true, limit: "200mb" }));

// ✅ Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/parent-categories", parentCategoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/media-types", mediaTypeRoutes);
app.use("/api/templates", templateRoutes);

// ✅ Sitemap
app.use(
  sitemapRouter({
    siteUrl: "https://globalpromotionllc.com",
    enableGzip: true,
  })
);

// ✅ robots.txt
app.get("/robots.txt", (req, res) => {
  // Ưu tiên env nếu có
  const origin =
    process.env.SITE_URL ||
    `${req.protocol}://${req.get("host")}`;

  res.type("text/plain").send(
    `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`
  );
});

// ✅ Health check
app.get("/", (req, res) => {
  res.send("CMS API is running...");
});

/**
 * ✅ Error handler cơ bản (để thấy rõ lỗi CORS / runtime)
 * (Nếu bạn có error handler riêng thì có thể bỏ phần này)
 */
app.use((err, req, res, next) => {
  // CORS block thường vào đây với Error("Not allowed by CORS...")
  console.error("APP ERROR:", err?.message || err);

  // Đừng leak stack ở production
  const status = err?.status || 500;
  res.status(status).json({
    message: err?.message || "Internal server error",
  });
});

module.exports = app;
