import {
  getAlternateOgLocales,
  type Locale,
  localeOgTags,
} from "@/i18n/routing";
import { SITE_URL } from "@/lib/site-config";

const OG_SIZE = { width: 1200, height: 630 } as const;

/**
 * Absolute URL for a segment's generated `opengraph-image.tsx` route.
 * @param pathAfterLocale e.g. "" (home), "/blog", "/blog/my-post", "/portfolio/foo"
 */
export function absoluteOgImageUrl(
  locale: Locale,
  pathAfterLocale = "",
): string {
  const normalized =
    pathAfterLocale === "" || pathAfterLocale.startsWith("/")
      ? pathAfterLocale
      : `/${pathAfterLocale}`;
  return `${SITE_URL}/${locale}${normalized}/opengraph-image`;
}

export function ogImageFields(
  locale: Locale,
  pathAfterLocale: string,
  alt: string,
) {
  const url = absoluteOgImageUrl(locale, pathAfterLocale);
  return {
    openGraphImages: [{ url, ...OG_SIZE, alt }] as const,
    twitterImage: url,
  };
}

export function buildOpenGraphLocaleFields(locale: Locale) {
  return {
    locale: localeOgTags[locale],
    alternateLocale: getAlternateOgLocales(locale),
  };
}
