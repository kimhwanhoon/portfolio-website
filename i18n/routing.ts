import { defineRouting } from "next-intl/routing";

/**
 * Single source of truth for supported locales.
 *
 * To add a new language:
 *   1. Add the locale code to `locales` below.
 *   2. Add the display name to `localeNames` below.
 *   3. Create `messages/{locale}.json` (copy `en.json` and translate).
 *
 * Everything else (admin tabs, switcher, validators, forms, queries) is
 * derived from this file automatically.
 */
export const routing = defineRouting({
  locales: ["en", "fr", "ko"],
  defaultLocale: "en",
});

export type Locale = (typeof routing.locales)[number];

/** Display name shown in the locale switcher and admin tabs. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  ko: "한국어",
};
