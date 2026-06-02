"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { images, imageTranslations, portfolioItems } from "@/lib/db/schema";
import { R2_BUCKET, r2Client } from "@/lib/r2/client";

/** Revalidate the public pages affected when a portfolio's images change. */
function revalidatePortfolioPublicPages(slug: string) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/portfolio/${slug}`);
  }
  revalidatePath("/");
}

export async function saveImageRecord(data: {
  url: string;
  portfolioId?: string | null;
  alt?: string;
  width?: number;
  height?: number;
  fileSize?: number;
}) {
  await requireAdmin();

  const [inserted] = await db
    .insert(images)
    .values({
      url: data.url,
      portfolioId: data.portfolioId ?? null,
      width: data.width ?? null,
      height: data.height ?? null,
      fileSize: data.fileSize ?? null,
    })
    .returning();

  // Create English alt text translation
  if (data.alt) {
    await db.insert(imageTranslations).values({
      imageId: inserted.id,
      locale: "en",
      alt: data.alt,
    });
  }

  revalidatePath("/admin/images");
  return inserted;
}

export async function deleteImage(id: string) {
  await requireAdmin();

  const image = await db.query.images.findFirst({
    where: eq(images.id, id),
  });
  if (!image) throw new Error("Not found");

  try {
    const key = new URL(image.url).pathname.slice(1);
    await r2Client.send(
      new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }),
    );
  } catch {
    console.error(`Failed to delete R2 object for image ${id}`);
  }

  // Cascade deletes translations
  await db.delete(images).where(eq(images.id, id));

  revalidatePath("/admin/images");

  // If the image was attached to a portfolio, refresh the public pages so the
  // gallery no longer serves the deleted image from cache.
  if (image.portfolioId) {
    const portfolio = await db.query.portfolioItems.findFirst({
      where: eq(portfolioItems.id, image.portfolioId),
      columns: { slug: true },
    });
    if (portfolio) revalidatePortfolioPublicPages(portfolio.slug);
  }
}

export async function updateImageAlt(id: string, alt: string) {
  await requireAdmin();

  const existing = await db
    .select()
    .from(imageTranslations)
    .where(eq(imageTranslations.imageId, id))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(imageTranslations)
      .set({ alt, updatedAt: new Date() })
      .where(eq(imageTranslations.imageId, id));
  } else {
    await db.insert(imageTranslations).values({
      imageId: id,
      locale: "en",
      alt,
    });
  }

  revalidatePath("/admin/images");
}
