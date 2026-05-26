/**
 * Single source of truth for site-wide constants.
 * Import `SITE_URL` instead of re-reading `process.env.NEXT_PUBLIC_SITE_URL`.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://hwanhoon.kim";

export const SITE_AUTHOR = "Kim Hwanhoon";
