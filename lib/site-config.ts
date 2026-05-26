/**
 * Single source of truth for site-wide constants.
 * Import `SITE_URL` instead of re-reading `process.env.NEXT_PUBLIC_SITE_URL`.
 */
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const SITE_URL = configuredSiteUrl || "https://hwanhoon.kim";

export const SITE_AUTHOR = "Kim Hwanhoon";

if (process.env.VERCEL_ENV === "production" && !configuredSiteUrl) {
  console.warn(
    "[site-config] NEXT_PUBLIC_SITE_URL is not set in production. Canonical URLs, sitemap, and OG tags will fall back to https://hwanhoon.kim — set this env var to your domain.",
  );
}

/** Search engine ownership verification tokens (optional). */
export const SITE_VERIFICATION = {
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : {}),
  ...(process.env.BING_SITE_VERIFICATION
    ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
    : {}),
  ...(process.env.YANDEX_SITE_VERIFICATION
    ? { yandex: process.env.YANDEX_SITE_VERIFICATION }
    : {}),
} satisfies Record<string, string | Record<string, string>>;
