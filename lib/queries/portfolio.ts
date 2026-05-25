import { and, asc, desc, eq } from "drizzle-orm";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { db } from "@/lib/db";
import {
  images,
  imageTranslations,
  portfolioItems,
  portfolioTranslations,
} from "@/lib/db/schema";

export async function getPublishedPortfolioItems(
  locale: Locale = routing.defaultLocale,
) {
  const items = await db
    .select({
      id: portfolioItems.id,
      slug: portfolioItems.slug,
      thumbnailUrl: portfolioItems.thumbnailUrl,
      techStack: portfolioItems.techStack,
      liveUrl: portfolioItems.liveUrl,
      githubUrl: portfolioItems.githubUrl,
      featured: portfolioItems.featured,
      sortOrder: portfolioItems.sortOrder,
      status: portfolioItems.status,
      startDate: portfolioItems.startDate,
      endDate: portfolioItems.endDate,
      title: portfolioTranslations.title,
      shortDescription: portfolioTranslations.shortDescription,
      fullDescription: portfolioTranslations.fullDescription,
    })
    .from(portfolioItems)
    .innerJoin(
      portfolioTranslations,
      and(
        eq(portfolioTranslations.portfolioId, portfolioItems.id),
        eq(portfolioTranslations.locale, locale),
      ),
    )
    .where(eq(portfolioItems.status, "published"))
    .orderBy(desc(portfolioItems.featured), asc(portfolioItems.sortOrder));

  return items;
}

export async function getPortfolioBySlug(
  slug: string,
  locale: Locale = routing.defaultLocale,
) {
  const rows = await db
    .select({
      id: portfolioItems.id,
      slug: portfolioItems.slug,
      thumbnailUrl: portfolioItems.thumbnailUrl,
      techStack: portfolioItems.techStack,
      liveUrl: portfolioItems.liveUrl,
      githubUrl: portfolioItems.githubUrl,
      featured: portfolioItems.featured,
      sortOrder: portfolioItems.sortOrder,
      status: portfolioItems.status,
      startDate: portfolioItems.startDate,
      endDate: portfolioItems.endDate,
      title: portfolioTranslations.title,
      shortDescription: portfolioTranslations.shortDescription,
      fullDescription: portfolioTranslations.fullDescription,
    })
    .from(portfolioItems)
    .innerJoin(
      portfolioTranslations,
      and(
        eq(portfolioTranslations.portfolioId, portfolioItems.id),
        eq(portfolioTranslations.locale, locale),
      ),
    )
    .where(
      and(
        eq(portfolioItems.slug, slug),
        eq(portfolioItems.status, "published"),
      ),
    )
    .limit(1);

  const item = rows[0];
  if (!item) return null;

  // Fetch images with translations
  const itemImages = await db
    .select({
      id: images.id,
      url: images.url,
      sortOrder: images.sortOrder,
      width: images.width,
      height: images.height,
      alt: imageTranslations.alt,
    })
    .from(images)
    .leftJoin(
      imageTranslations,
      and(
        eq(imageTranslations.imageId, images.id),
        eq(imageTranslations.locale, locale),
      ),
    )
    .where(eq(images.portfolioId, item.id))
    .orderBy(asc(images.sortOrder));

  return {
    ...item,
    images: itemImages,
  };
}

export async function getAllPublishedSlugs() {
  const items = await db
    .select({ slug: portfolioItems.slug })
    .from(portfolioItems)
    .where(eq(portfolioItems.status, "published"));
  return items.map((i) => ({ slug: i.slug }));
}

// For admin: get all items with English translations
export async function getAllPortfolioItemsForAdmin() {
  return db
    .select({
      id: portfolioItems.id,
      slug: portfolioItems.slug,
      thumbnailUrl: portfolioItems.thumbnailUrl,
      techStack: portfolioItems.techStack,
      liveUrl: portfolioItems.liveUrl,
      githubUrl: portfolioItems.githubUrl,
      featured: portfolioItems.featured,
      sortOrder: portfolioItems.sortOrder,
      status: portfolioItems.status,
      startDate: portfolioItems.startDate,
      endDate: portfolioItems.endDate,
      updatedAt: portfolioItems.updatedAt,
      title: portfolioTranslations.title,
      shortDescription: portfolioTranslations.shortDescription,
      fullDescription: portfolioTranslations.fullDescription,
    })
    .from(portfolioItems)
    .innerJoin(
      portfolioTranslations,
      and(
        eq(portfolioTranslations.portfolioId, portfolioItems.id),
        eq(portfolioTranslations.locale, "en"),
      ),
    )
    .orderBy(asc(portfolioItems.sortOrder));
}

export async function getPortfolioItemForEdit(id: string) {
  const rows = await db
    .select({
      id: portfolioItems.id,
      slug: portfolioItems.slug,
      thumbnailUrl: portfolioItems.thumbnailUrl,
      techStack: portfolioItems.techStack,
      liveUrl: portfolioItems.liveUrl,
      githubUrl: portfolioItems.githubUrl,
      featured: portfolioItems.featured,
      sortOrder: portfolioItems.sortOrder,
      status: portfolioItems.status,
      startDate: portfolioItems.startDate,
      endDate: portfolioItems.endDate,
      title: portfolioTranslations.title,
      shortDescription: portfolioTranslations.shortDescription,
      fullDescription: portfolioTranslations.fullDescription,
    })
    .from(portfolioItems)
    .innerJoin(
      portfolioTranslations,
      and(
        eq(portfolioTranslations.portfolioId, portfolioItems.id),
        eq(portfolioTranslations.locale, "en"),
      ),
    )
    .where(eq(portfolioItems.id, id))
    .limit(1);

  return rows[0] ?? null;
}
