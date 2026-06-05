// Single source of truth for the public site origin (used by sitemap, robots,
// and Open Graph metadata). No trailing slash.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://muaythaiguide.com"
).replace(/\/$/, "");
