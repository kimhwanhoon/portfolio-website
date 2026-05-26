import type { Metadata } from "next";
import { type Locale, routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site-config";

/**
 * Build `alternates` metadata (canonical + hreflang languages + x-default)
 * for a locale-prefixed page.
 *
 * @param locale  Current request locale.
 * @param suffix  Path *after* `/[locale]` — must start with "/" or be empty.
 *                Examples: "", "/about", "/blog", "/blog/my-post"
 */
export function buildAlternates(
  locale: Locale,
  suffix = "",
): NonNullable<Metadata["alternates"]> {
  const normalized =
    suffix === "" || suffix.startsWith("/") ? suffix : `/${suffix}`;

  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `${SITE_URL}/${l}${normalized}`;
  }
  languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${normalized}`;

  return {
    canonical: `${SITE_URL}/${locale}${normalized}`,
    languages,
  };
}
