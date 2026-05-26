import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getAllPublishedSlugs } from "@/lib/queries/portfolio";
import { getAllPublishedPostSlugs } from "@/lib/queries/post";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kimhwanhoon.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [portfolioSlugs, postSlugs] = await Promise.all([
    getAllPublishedSlugs(),
    getAllPublishedPostSlugs(),
  ]);

  const portfolioEntries = portfolioSlugs.map(({ slug }) => ({
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
    {
      url: `${BASE_URL}/${routing.defaultLocale}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...portfolioEntries,
    ...postSlugs.map(({ slug }) => ({
      url: `${BASE_URL}/${routing.defaultLocale}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
