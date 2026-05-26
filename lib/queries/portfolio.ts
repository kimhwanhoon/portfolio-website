import { and, asc, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { db } from "@/lib/db";
import {
  images,
  imageTranslations,
  portfolioItems,
  portfolioTranslations,
} from "@/lib/db/schema";
import { coalesceTranslation, DEFAULT_LOCALE } from "@/lib/db/translations";
import type { TranslationsFor } from "@/lib/i18n/zod-helpers";
import type { PortfolioTranslationData } from "@/lib/validators/portfolio";

const portfolioT = portfolioTranslations;
const portfolioTEn = alias(portfolioTranslations, "portfolio_translations_en");
const imageT = imageTranslations;
const imageTEn = alias(imageTranslations, "image_translations_en");

function portfolioTranslationSelect() {
  return {
    title: coalesceTranslation(portfolioT.title, portfolioTEn.title),
    shortDescription: coalesceTranslation(
      portfolioT.shortDescription,
      portfolioTEn.shortDescription,
    ),
    fullDescription: coalesceTranslation(
      portfolioT.fullDescription,
      portfolioTEn.fullDescription,
    ),
  };
}

function portfolioTranslationJoins(locale: Locale) {
  return {
    innerJoinEn: {
      table: portfolioTEn,
      on: and(
        eq(portfolioTEn.portfolioId, portfolioItems.id),
        eq(portfolioTEn.locale, DEFAULT_LOCALE),
      ),
    },
    leftJoinLocale: {
      table: portfolioT,
      on: and(
        eq(portfolioT.portfolioId, portfolioItems.id),
        eq(portfolioT.locale, locale),
      ),
    },
  };
}

export async function getPublishedPortfolioItems(
  locale: Locale = routing.defaultLocale,
) {
  const joins = portfolioTranslationJoins(locale);

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
      ...portfolioTranslationSelect(),
    })
    .from(portfolioItems)
    .innerJoin(joins.innerJoinEn.table, joins.innerJoinEn.on)
    .leftJoin(joins.leftJoinLocale.table, joins.leftJoinLocale.on)
    .where(eq(portfolioItems.status, "published"))
    .orderBy(desc(portfolioItems.featured), asc(portfolioItems.sortOrder));

  return items;
}

export async function getPortfolioBySlug(
  slug: string,
  locale: Locale = routing.defaultLocale,
) {
  const joins = portfolioTranslationJoins(locale);

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
      ...portfolioTranslationSelect(),
    })
    .from(portfolioItems)
    .innerJoin(joins.innerJoinEn.table, joins.innerJoinEn.on)
    .leftJoin(joins.leftJoinLocale.table, joins.leftJoinLocale.on)
    .where(
      and(
        eq(portfolioItems.slug, slug),
        eq(portfolioItems.status, "published"),
      ),
    )
    .limit(1);

  const item = rows[0];
  if (!item) return null;

  const itemImages = await db
    .select({
      id: images.id,
      url: images.url,
      sortOrder: images.sortOrder,
      width: images.width,
      height: images.height,
      alt: coalesceTranslation(imageT.alt, imageTEn.alt),
    })
    .from(images)
    .innerJoin(
      imageTEn,
      and(eq(imageTEn.imageId, images.id), eq(imageTEn.locale, DEFAULT_LOCALE)),
    )
    .leftJoin(
      imageT,
      and(eq(imageT.imageId, images.id), eq(imageT.locale, locale)),
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
        eq(portfolioTranslations.locale, DEFAULT_LOCALE),
      ),
    )
    .orderBy(asc(portfolioItems.sortOrder));
}

export async function getAllImagesForAdmin() {
  return db
    .select({
      id: images.id,
      url: images.url,
      portfolioId: images.portfolioId,
      sortOrder: images.sortOrder,
      width: images.width,
      height: images.height,
      fileSize: images.fileSize,
      createdAt: images.createdAt,
      alt: imageTranslations.alt,
    })
    .from(images)
    .leftJoin(
      imageTranslations,
      and(
        eq(imageTranslations.imageId, images.id),
        eq(imageTranslations.locale, DEFAULT_LOCALE),
      ),
    )
    .orderBy(desc(images.createdAt));
}

export type PortfolioEditTranslations =
  TranslationsFor<PortfolioTranslationData>;

export async function getPortfolioItemForEdit(id: string) {
  const item = await db.query.portfolioItems.findFirst({
    where: eq(portfolioItems.id, id),
    with: { translations: true },
  });

  if (!item) return null;

  const byLocale = Object.fromEntries(
    item.translations.map((t) => [
      t.locale,
      {
        title: t.title,
        shortDescription: t.shortDescription,
        fullDescription: t.fullDescription,
      },
    ]),
  ) as Partial<Record<Locale, PortfolioTranslationData>>;

  const defaultTranslation = byLocale[routing.defaultLocale];
  if (!defaultTranslation) return null;

  const translations = {
    ...byLocale,
    [routing.defaultLocale]: defaultTranslation,
  } as PortfolioEditTranslations;

  return {
    id: item.id,
    slug: item.slug,
    thumbnailUrl: item.thumbnailUrl,
    techStack: item.techStack,
    liveUrl: item.liveUrl,
    githubUrl: item.githubUrl,
    featured: item.featured,
    sortOrder: item.sortOrder,
    status: item.status,
    startDate: item.startDate,
    endDate: item.endDate,
    translations,
  };
}
