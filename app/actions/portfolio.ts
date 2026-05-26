"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { images, portfolioItems, portfolioTranslations } from "@/lib/db/schema";
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
  revalidatePath("/en");
  revalidatePath("/");
}

export async function createPortfolio(data: unknown) {
  await requireAdmin();
  const validated = portfolioSchema.parse(data);

  const slug = validated.slug || slugify(validated.title);

  // Insert base item (language-agnostic fields)
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

  // Insert English translation
  await db.insert(portfolioTranslations).values({
    portfolioId: inserted.id,
    locale: "en",
    title: validated.title,
    shortDescription: validated.shortDescription,
    fullDescription: validated.fullDescription,
  });

  revalidateAll();
  redirect("/admin");
}

export async function updatePortfolio(
  id: string,
  data: unknown,
  imageIds?: string[],
) {
  await requireAdmin();
  const validated = portfolioSchema.parse(data);

  const slug = validated.slug || slugify(validated.title);

  // Update base item
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

  // Upsert English translation
  const existing = await db
    .select()
    .from(portfolioTranslations)
    .where(eq(portfolioTranslations.portfolioId, id))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(portfolioTranslations)
      .set({
        title: validated.title,
        shortDescription: validated.shortDescription,
        fullDescription: validated.fullDescription,
        updatedAt: new Date(),
      })
      .where(eq(portfolioTranslations.portfolioId, id));
  } else {
    await db.insert(portfolioTranslations).values({
      portfolioId: id,
      locale: "en",
      title: validated.title,
      shortDescription: validated.shortDescription,
      fullDescription: validated.fullDescription,
    });
  }

  // Assign images if provided
  if (imageIds && imageIds.length > 0) {
    for (let i = 0; i < imageIds.length; i++) {
      await db
        .update(images)
        .set({ portfolioId: id, sortOrder: i })
        .where(eq(images.id, imageIds[i]));
    }
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

  // Cascade deletes translations and image records
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
