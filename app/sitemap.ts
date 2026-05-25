import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getAllPublishedSlugs } from "@/lib/queries/portfolio";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kimhwanhoon.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllPublishedSlugs();

  const portfolioEntries = slugs.map(({ slug }) => ({
    url: `${BASE_URL}/${routing.defaultLocale}/portfolio/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: `${BASE_URL}/${routing.defaultLocale}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/${routing.defaultLocale}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...portfolioEntries,
  ];
}
