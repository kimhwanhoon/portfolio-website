"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { portfolioItems, images } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { portfolioSchema } from "@/lib/validators/portfolio";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET } from "@/lib/r2/client";

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function createPortfolio(data: unknown) {
  await requireAdmin();
  const validated = portfolioSchema.parse(data);

  const slug = validated.slug || slugify(validated.title);

  await db.insert(portfolioItems).values({
    ...validated,
    slug,
    thumbnailUrl: validated.thumbnailUrl || null,
    liveUrl: validated.liveUrl || null,
    githubUrl: validated.githubUrl || null,
    startDate: validated.startDate ?? null,
    endDate: validated.endDate ?? null,
  });

  revalidatePath("/admin");
  redirect("/admin");
}

export async function updatePortfolio(id: string, data: unknown) {
  await requireAdmin();
  const validated = portfolioSchema.parse(data);

  const slug = validated.slug || slugify(validated.title);

  await db
    .update(portfolioItems)
    .set({
      ...validated,
      slug,
      thumbnailUrl: validated.thumbnailUrl || null,
      liveUrl: validated.liveUrl || null,
      githubUrl: validated.githubUrl || null,
      startDate: validated.startDate ?? null,
      endDate: validated.endDate ?? null,
      updatedAt: new Date(),
    })
    .where(eq(portfolioItems.id, id));

  revalidatePath("/admin");
  redirect("/admin");
}

export async function deletePortfolio(id: string) {
  await requireAdmin();

  // Find all images to delete from R2
  const itemImages = await db
    .select()
    .from(images)
    .where(eq(images.portfolioId, id));

  // Delete images from R2
  for (const image of itemImages) {
    try {
      const key = new URL(image.url).pathname.slice(1);
      await r2Client.send(
        new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key })
      );
    } catch {
      // Log but don't fail the whole operation for R2 cleanup issues
      console.error(`Failed to delete R2 object for image ${image.id}`);
    }
  }

  // DB cascade handles image record deletion
  await db.delete(portfolioItems).where(eq(portfolioItems.id, id));

  revalidatePath("/admin");
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

  revalidatePath("/admin");
}
