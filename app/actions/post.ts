"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { processPostContent } from "@/lib/blog/content";
import { db } from "@/lib/db";
import { isUniqueViolation } from "@/lib/db/errors";
import type { TiptapJSON } from "@/lib/db/schema";
import { posts, postTags, postTranslations, tags } from "@/lib/db/schema";
import { postSchema } from "@/lib/validators/post";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function revalidateBlogPaths() {
  revalidatePath("/admin/posts");
  revalidatePath("/en/blog");
  revalidatePath("/");
}

async function clearFeaturedPosts() {
  await db.update(posts).set({ featured: false, updatedAt: new Date() });
}

async function ensureTags(tagSlugs: string[]): Promise<string[]> {
  const ids: string[] = [];

  for (const raw of tagSlugs) {
    const slug = slugify(raw);
    if (!slug) continue;

    const name = raw.trim();
    const existing = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);

    if (existing[0]) {
      ids.push(existing[0].id);
      continue;
    }

    const [inserted] = await db
      .insert(tags)
      .values({ slug, name })
      .returning({ id: tags.id });
    ids.push(inserted.id);
  }

  return ids;
}

async function syncPostTags(postId: string, tagSlugs: string[]) {
  await db.delete(postTags).where(eq(postTags.postId, postId));
  const tagIds = await ensureTags(tagSlugs);

  if (tagIds.length > 0) {
    await db
      .insert(postTags)
      .values(tagIds.map((tagId) => ({ postId, tagId })));
  }
}

export async function createPost(data: unknown) {
  await requireAdmin();
  const validated = postSchema.parse(data);
  const slug = validated.slug || slugify(validated.title);
  const { contentHtml, readingMinutes } = await processPostContent(
    validated.contentJson as TiptapJSON,
    validated.contentHtml,
  );

  const publishedAt =
    validated.status === "published"
      ? (validated.publishedAt ?? new Date())
      : (validated.publishedAt ?? null);

  if (validated.featured) {
    await clearFeaturedPosts();
  }

  let inserted: { id: string };
  try {
    [inserted] = await db
      .insert(posts)
      .values({
        slug,
        coverImageUrl: validated.coverImageUrl || null,
        status: validated.status,
        featured: validated.featured,
        readingMinutes,
        publishedAt,
      })
      .returning({ id: posts.id });
  } catch (e) {
    if (isUniqueViolation(e, "posts_slug_unique")) {
      throw new Error(
        `A post with slug "${slug}" already exists. Choose a different slug.`,
      );
    }
    throw e;
  }

  await db.insert(postTranslations).values({
    postId: inserted.id,
    locale: "en",
    title: validated.title,
    excerpt: validated.excerpt,
    contentJson: validated.contentJson as TiptapJSON,
    contentHtml,
  });

  await syncPostTags(inserted.id, validated.tagSlugs);

  revalidateBlogPaths();
  redirect("/admin/posts");
}

export async function updatePost(id: string, data: unknown) {
  await requireAdmin();
  const validated = postSchema.parse(data);
  const slug = validated.slug || slugify(validated.title);
  const { contentHtml, readingMinutes } = await processPostContent(
    validated.contentJson as TiptapJSON,
    validated.contentHtml,
  );

  const publishedAt =
    validated.status === "published"
      ? (validated.publishedAt ?? new Date())
      : (validated.publishedAt ?? null);

  if (validated.featured) {
    await clearFeaturedPosts();
  }

  try {
    await db
      .update(posts)
      .set({
        slug,
        coverImageUrl: validated.coverImageUrl || null,
        status: validated.status,
        featured: validated.featured,
        readingMinutes,
        publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));
  } catch (e) {
    if (isUniqueViolation(e, "posts_slug_unique")) {
      throw new Error(
        `A post with slug "${slug}" already exists. Choose a different slug.`,
      );
    }
    throw e;
  }

  const existing = await db
    .select()
    .from(postTranslations)
    .where(eq(postTranslations.postId, id))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(postTranslations)
      .set({
        title: validated.title,
        excerpt: validated.excerpt,
        contentJson: validated.contentJson as TiptapJSON,
        contentHtml,
        updatedAt: new Date(),
      })
      .where(eq(postTranslations.postId, id));
  } else {
    await db.insert(postTranslations).values({
      postId: id,
      locale: "en",
      title: validated.title,
      excerpt: validated.excerpt,
      contentJson: validated.contentJson as TiptapJSON,
      contentHtml,
    });
  }

  await syncPostTags(id, validated.tagSlugs);

  revalidateBlogPaths();
  redirect("/admin/posts");
}

export async function deletePost(id: string) {
  await requireAdmin();
  await db.delete(posts).where(eq(posts.id, id));
  revalidateBlogPaths();
}

export async function togglePostStatus(id: string) {
  await requireAdmin();

  const item = await db.query.posts.findFirst({
    where: eq(posts.id, id),
  });
  if (!item) throw new Error("Not found");

  const newStatus = item.status === "published" ? "draft" : "published";
  const publishedAt =
    newStatus === "published"
      ? (item.publishedAt ?? new Date())
      : item.publishedAt;

  await db
    .update(posts)
    .set({
      status: newStatus,
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id));

  revalidateBlogPaths();
}

export async function togglePostFeatured(id: string) {
  await requireAdmin();

  const item = await db.query.posts.findFirst({
    where: eq(posts.id, id),
  });
  if (!item) throw new Error("Not found");

  if (!item.featured) {
    await db.update(posts).set({ featured: false, updatedAt: new Date() });
    await db
      .update(posts)
      .set({ featured: true, updatedAt: new Date() })
      .where(eq(posts.id, id));
  } else {
    await db
      .update(posts)
      .set({ featured: false, updatedAt: new Date() })
      .where(eq(posts.id, id));
  }

  revalidateBlogPaths();
}
