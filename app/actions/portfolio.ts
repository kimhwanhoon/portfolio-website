"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { and, eq, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { images, portfolioItems } from "@/lib/db/schema";
import {
  isTranslationEmpty,
  translationEntries,
  upsertPortfolioTranslation,
} from "@/lib/db/translations";
import { R2_BUCKET, r2Client } from "@/lib/r2/client";
import { portfolioSchema } from "@/lib/validators/portfolio";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function revalidateAll() {
  revalidatePath("/admin");
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
  }
  revalidatePath("/");
}

function normalizePortfolioPayload(data: unknown) {
  const validated = portfolioSchema.parse(data);
  const { fr, ...rest } = validated.translations;
  const translations = {
    en: validated.translations.en,
    ...(isTranslationEmpty(fr) ? {} : { fr }),
  };
  return { ...validated, translations };
}

async function syncPortfolioTranslations(
  portfolioId: string,
  translations: ReturnType<typeof normalizePortfolioPayload>["translations"],
) {
  for (const [locale, values] of translationEntries(translations)) {
    await upsertPortfolioTranslation(portfolioId, locale, values);
  }
}

/**
 * Sync the set of images belonging to a portfolio item:
 * - Unlink any image currently attached to this portfolio that is NOT in
 *   the desired set (sets portfolioId to null so it's available again).
 * - Attach + reorder the desired set (sortOrder follows the array order).
 * Pass an empty array to unlink everything.
 */
async function syncPortfolioImages(portfolioId: string, imageIds: string[]) {
  if (imageIds.length === 0) {
    await db
      .update(images)
      .set({ portfolioId: null, sortOrder: 0 })
      .where(eq(images.portfolioId, portfolioId));
    return;
  }

  await db
    .update(images)
    .set({ portfolioId: null, sortOrder: 0 })
    .where(
      and(eq(images.portfolioId, portfolioId), notInArray(images.id, imageIds)),
    );

  for (let i = 0; i < imageIds.length; i++) {
    await db
      .update(images)
      .set({ portfolioId, sortOrder: i })
      .where(eq(images.id, imageIds[i]));
  }
}

export async function createPortfolio(data: unknown, imageIds?: string[]) {
  await requireAdmin();
  const validated = normalizePortfolioPayload(data);

  const slug = validated.slug || slugify(validated.translations.en.title);

  const [inserted] = await db
    .insert(portfolioItems)
    .values({
      slug,
      thumbnailUrl: validated.thumbnailUrl || null,
      techStack: validated.techStack,
      liveUrl: validated.liveUrl || null,
      githubUrl: validated.githubUrl || null,
      featured: validated.featured,
      sortOrder: validated.sortOrder,
      status: validated.status,
      startDate: validated.startDate ?? null,
      endDate: validated.endDate ?? null,
    })
    .returning({ id: portfolioItems.id });

  await syncPortfolioTranslations(inserted.id, validated.translations);

  if (imageIds) {
    await syncPortfolioImages(inserted.id, imageIds);
  }

  revalidateAll();
  redirect("/admin");
}

export async function updatePortfolio(
  id: string,
  data: unknown,
  imageIds?: string[],
) {
  await requireAdmin();
  const validated = normalizePortfolioPayload(data);

  const slug = validated.slug || slugify(validated.translations.en.title);

  await db
    .update(portfolioItems)
    .set({
      slug,
      thumbnailUrl: validated.thumbnailUrl || null,
      techStack: validated.techStack,
      liveUrl: validated.liveUrl || null,
      githubUrl: validated.githubUrl || null,
      featured: validated.featured,
      sortOrder: validated.sortOrder,
      status: validated.status,
      startDate: validated.startDate ?? null,
      endDate: validated.endDate ?? null,
      updatedAt: new Date(),
    })
    .where(eq(portfolioItems.id, id));

  await syncPortfolioTranslations(id, validated.translations);

  if (imageIds) {
    await syncPortfolioImages(id, imageIds);
  }

  revalidateAll();
  redirect("/admin");
}

export async function deletePortfolio(id: string) {
  await requireAdmin();

  const itemImages = await db
    .select()
    .from(images)
    .where(eq(images.portfolioId, id));

  for (const image of itemImages) {
    try {
      const key = new URL(image.url).pathname.slice(1);
      await r2Client.send(
        new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }),
      );
    } catch {
      console.error(`Failed to delete R2 object for image ${image.id}`);
    }
  }

  await db.delete(portfolioItems).where(eq(portfolioItems.id, id));

  revalidateAll();
}

export async function togglePortfolioStatus(id: string) {
  await requireAdmin();

  const item = await db.query.portfolioItems.findFirst({
    where: eq(portfolioItems.id, id),
  });
  if (!item) throw new Error("Not found");

  await db
    .update(portfolioItems)
    .set({
      status: item.status === "published" ? "draft" : "published",
      updatedAt: new Date(),
    })
    .where(eq(portfolioItems.id, id));

  revalidateAll();
}
