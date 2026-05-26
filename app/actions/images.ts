"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { images, imageTranslations } from "@/lib/db/schema";
import { R2_BUCKET, r2Client } from "@/lib/r2/client";

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

export async function assignImagesToPortfolio(
  imageIds: string[],
  portfolioId: string,
) {
  await requireAdmin();

  for (let i = 0; i < imageIds.length; i++) {
    await db
      .update(images)
      .set({ portfolioId, sortOrder: i })
      .where(eq(images.id, imageIds[i]));
  }

  revalidatePath("/admin");
  revalidatePath("/admin/images");
}

export async function unassignImageFromPortfolio(imageId: string) {
  await requireAdmin();

  await db
    .update(images)
    .set({ portfolioId: null, sortOrder: 0 })
    .where(eq(images.id, imageId));

  revalidatePath("/admin");
  revalidatePath("/admin/images");
}
