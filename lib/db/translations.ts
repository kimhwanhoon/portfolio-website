import { type SQL, sql } from "drizzle-orm";
import type { AnyColumn } from "drizzle-orm/column";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { db } from "@/lib/db";
import {
  imageTranslations,
  portfolioTranslations,
  postTranslations,
} from "@/lib/db/schema";

export const DEFAULT_LOCALE: Locale = routing.defaultLocale;

/** COALESCE(locale column, English fallback column) for translated text fields. */
export function coalesceTranslation(
  localeColumn: AnyColumn,
  fallbackColumn: AnyColumn,
): SQL<string> {
  return sql<string>`coalesce(${localeColumn}, ${fallbackColumn})`;
}

export type PortfolioTranslationValues = {
  title: string;
  shortDescription: string;
  fullDescription: string;
};

export async function upsertPortfolioTranslation(
  portfolioId: string,
  locale: string,
  values: PortfolioTranslationValues,
) {
  await db
    .insert(portfolioTranslations)
    .values({
      portfolioId,
      locale,
      ...values,
    })
    .onConflictDoUpdate({
      target: [portfolioTranslations.portfolioId, portfolioTranslations.locale],
      set: {
        ...values,
        updatedAt: new Date(),
      },
    });
}

export type PostTranslationValues = {
  title: string;
  excerpt: string;
  contentJson: Record<string, unknown>;
  contentHtml: string;
};

export async function upsertPostTranslation(
  postId: string,
  locale: string,
  values: PostTranslationValues,
) {
  await db
    .insert(postTranslations)
    .values({
      postId,
      locale,
      ...values,
    })
    .onConflictDoUpdate({
      target: [postTranslations.postId, postTranslations.locale],
      set: {
        ...values,
        updatedAt: new Date(),
      },
    });
}

export async function upsertImageTranslation(
  imageId: string,
  locale: string,
  alt: string,
) {
  await db
    .insert(imageTranslations)
    .values({ imageId, locale, alt })
    .onConflictDoUpdate({
      target: [imageTranslations.imageId, imageTranslations.locale],
      set: { alt, updatedAt: new Date() },
    });
}

// Re-export pure helpers so existing server-side imports keep working.
export {
  isTranslationEmpty,
  translationEntries,
} from "@/lib/i18n/translation-utils";
