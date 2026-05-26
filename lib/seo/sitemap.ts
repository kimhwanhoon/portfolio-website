import type { MetadataRoute } from "next";
import { type Locale, routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site-config";

function languageAlternates(
  suffix: string,
): NonNullable<MetadataRoute.Sitemap[number]["alternates"]> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `${SITE_URL}/${locale}${suffix}`;
  }
  languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${suffix}`;
  return { languages };
}

type SitemapEntryOptions = {
  suffix: string;
  lastModified: Date;
  images?: string[];
};

/** One sitemap row per locale, each with full hreflang alternates. */
export function buildLocalizedSitemapEntries({
  suffix,
  lastModified,
  images,
}: SitemapEntryOptions): MetadataRoute.Sitemap {
  const normalized =
    suffix === "" || suffix.startsWith("/") ? suffix : `/${suffix}`;

  return routing.locales.map((locale) => ({
    url: `${SITE_URL}/${locale}${normalized}`,
    lastModified,
    alternates: languageAlternates(normalized),
    ...(images && images.length > 0 ? { images } : {}),
  }));
}
