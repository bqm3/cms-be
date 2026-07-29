const canonicalSiteUrl = (process.env.SITE_URL || "https://couponzas.com").replace(/\/+$/, "");

const extraAllowedOrigins = (process.env.ALLOWED_ORIGINS || "https://couponzas.com")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function normalizeOrigin(origin) {
  try {
    const url = new URL(origin);
    return url.origin.toLowerCase();
  } catch {
    return "";
  }
}

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://172.21.164.1:5173",
  "http://192.168.1.19:5173",
  "https://couponzas.com",
  canonicalSiteUrl,
  ...extraAllowedOrigins,
  "https://0858-101-99-6-230.ngrok-free.app/",
  "https://f281-2001-ee0-49c4-a950-fdfb-7e67-3a8f-5e7.ngrok-free.app",
]
  .map(normalizeOrigin)
  .filter((value, index, self) => self.indexOf(value) === index);

module.exports = {
  canonicalSiteUrl,
  allowedOrigins,
  normalizeOrigin,
};
