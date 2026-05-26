import type { MetadataRoute } from "next";
import { getAllPublishedSlugs } from "@/lib/queries/portfolio";
import { getAllPublishedPostSlugs } from "@/lib/queries/post";
import { buildLocalizedSitemapEntries } from "@/lib/seo/sitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [portfolioSlugs, postSlugs] = await Promise.all([
    getAllPublishedSlugs(),
    getAllPublishedPostSlugs(),
  ]);

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    ...buildLocalizedSitemapEntries({ suffix: "", lastModified: now }),
    ...buildLocalizedSitemapEntries({ suffix: "/about", lastModified: now }),
    ...buildLocalizedSitemapEntries({ suffix: "/blog", lastModified: now }),
  ];

  const portfolioPages = portfolioSlugs.flatMap(
    ({ slug, updatedAt, thumbnailUrl }) =>
      buildLocalizedSitemapEntries({
        suffix: `/portfolio/${slug}`,
        lastModified: updatedAt,
        images: thumbnailUrl ? [thumbnailUrl] : undefined,
      }),
  );

  const blogPages = postSlugs.flatMap(({ slug, updatedAt, coverImageUrl }) =>
    buildLocalizedSitemapEntries({
      suffix: `/blog/${slug}`,
      lastModified: updatedAt,
      images: coverImageUrl ? [coverImageUrl] : undefined,
    }),
  );

  return [...staticPages, ...portfolioPages, ...blogPages];
}
