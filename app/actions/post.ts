"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/auth/admin";
import { processPostContent } from "@/lib/blog/content";
import { db } from "@/lib/db";
import { isUniqueViolation } from "@/lib/db/errors";
import type { TiptapJSON } from "@/lib/db/schema";
import { posts, postTags, tags } from "@/lib/db/schema";
import {
  isTranslationEmpty,
  translationEntries,
  upsertPostTranslation,
} from "@/lib/db/translations";
import { type PostTranslationData, postSchema } from "@/lib/validators/post";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function resolveSlug(data: { slug?: string; title: string }): string {
  const slug = data.slug?.trim()
    ? slugify(data.slug.trim())
    : slugify(data.title);
  if (!slug) {
    throw new Error(
      "Could not generate a valid slug. Please provide a slug or title.",
    );
  }
  return slug;
}

function revalidateBlogPaths(slugs: string[] = []) {
  const uniqueSlugs = [...new Set(slugs.filter(Boolean))];

  revalidatePath("/admin/posts");
  revalidatePath("/sitemap.xml");

  for (const locale of routing.locales) {
    revalidatePath(`/${locale}/blog`);
    for (const slug of uniqueSlugs) {
      revalidatePath(`/${locale}/blog/${slug}`);
    }
  }
}

async function setExclusiveFeatured(postId: string) {
  await db.update(posts).set({
    featured: sql`${posts.id} = ${postId}`,
    updatedAt: new Date(),
  });
}

async function findTagBySlug(slug: string) {
  const existing = await db
    .select({ id: tags.id })
    .from(tags)
    .where(eq(tags.slug, slug))
    .limit(1);
  return existing[0]?.id ?? null;
}

async function ensureTags(tagSlugs: string[]): Promise<string[]> {
  const ids: string[] = [];

  for (const raw of tagSlugs) {
    const slug = slugify(raw.trim());
    if (!slug) continue;

    const existingId = await findTagBySlug(slug);
    if (existingId) {
      ids.push(existingId);
      continue;
    }

    const name = raw.trim() || slug;
    try {
      const [inserted] = await db
        .insert(tags)
        .values({ slug, name })
        .returning({ id: tags.id });
      ids.push(inserted.id);
    } catch (e) {
      if (isUniqueViolation(e, "tags_slug_unique")) {
        const racedId = await findTagBySlug(slug);
        if (racedId) ids.push(racedId);
        continue;
      }
      throw e;
    }
  }

  return ids;
}

async function syncPostTags(postId: string, tagSlugs: string[]) {
  const normalized = [
    ...new Set(
      tagSlugs
        .map((raw) => slugify(raw.trim()))
        .filter((slug) => slug.length > 0),
    ),
  ];

  await db.delete(postTags).where(eq(postTags.postId, postId));
  const tagIds = await ensureTags(normalized);

  const uniqueTagIds = [...new Set(tagIds)];
  if (uniqueTagIds.length > 0) {
    await db
      .insert(postTags)
      .values(uniqueTagIds.map((tagId) => ({ postId, tagId })));
  }
}

function normalizePostPayload(data: unknown) {
  const validated = postSchema.parse(data);
  const { fr, ...rest } = validated.translations;
  const translations = {
    en: validated.translations.en,
    ...(isTranslationEmpty(fr) ? {} : { fr }),
  };
  return { ...validated, translations };
}

async function syncPostTranslations(
  postId: string,
  translations: ReturnType<typeof normalizePostPayload>["translations"],
) {
  for (const [locale, values] of translationEntries(translations)) {
    await upsertPostTranslation(postId, locale, values);
  }
}

async function processTranslation(translation: PostTranslationData) {
  const { contentHtml } = await processPostContent(
    translation.contentJson as TiptapJSON,
    translation.contentHtml,
  );
  return { ...translation, contentHtml };
}

export async function createPost(data: unknown) {
  await requireAdmin();
  const validated = normalizePostPayload(data);
  const slug = resolveSlug({
    slug: validated.slug,
    title: validated.translations.en.title,
  });

  const enTranslation = await processTranslation(validated.translations.en);
  const { readingMinutes } = await processPostContent(
    enTranslation.contentJson as TiptapJSON,
    enTranslation.contentHtml,
  );

  const translationsToSync: ReturnType<
    typeof normalizePostPayload
  >["translations"] = { en: enTranslation };

  if (validated.translations.fr) {
    translationsToSync.fr = await processTranslation(validated.translations.fr);
  }

  const publishedAt =
    validated.status === "published"
      ? (validated.publishedAt ?? new Date())
      : (validated.publishedAt ?? null);

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

  if (validated.featured) {
    await setExclusiveFeatured(inserted.id);
  }

  await syncPostTranslations(inserted.id, translationsToSync);

  await syncPostTags(inserted.id, validated.tagSlugs);

  revalidateBlogPaths([slug]);
  redirect("/admin/posts");
}

export async function updatePost(id: string, data: unknown) {
  await requireAdmin();
  const validated = normalizePostPayload(data);
  const slug = resolveSlug({
    slug: validated.slug,
    title: validated.translations.en.title,
  });

  const existingPost = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    columns: { slug: true },
  });
  if (!existingPost) {
    throw new Error("Post not found");
  }

  const oldSlug = existingPost.slug;

  const enTranslation = await processTranslation(validated.translations.en);
  const { readingMinutes } = await processPostContent(
    enTranslation.contentJson as TiptapJSON,
    enTranslation.contentHtml,
  );

  const translationsToSync: ReturnType<
    typeof normalizePostPayload
  >["translations"] = { en: enTranslation };

  if (validated.translations.fr) {
    translationsToSync.fr = await processTranslation(validated.translations.fr);
  }

  const publishedAt =
    validated.status === "published"
      ? (validated.publishedAt ?? new Date())
      : (validated.publishedAt ?? null);

  if (validated.featured) {
    await setExclusiveFeatured(id);
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

  await syncPostTranslations(id, translationsToSync);

  await syncPostTags(id, validated.tagSlugs);

  revalidateBlogPaths([oldSlug, slug]);
  redirect("/admin/posts");
}

export async function deletePost(id: string) {
  await requireAdmin();

  const existingPost = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    columns: { slug: true },
  });

  await db.delete(posts).where(eq(posts.id, id));
  revalidateBlogPaths(existingPost?.slug ? [existingPost.slug] : []);
}

export async function togglePostStatus(id: string) {
  await requireAdmin();

  const item = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    columns: { id: true, status: true, publishedAt: true, slug: true },
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

  revalidateBlogPaths([item.slug]);
}

export async function togglePostFeatured(id: string) {
  await requireAdmin();

  const item = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    columns: { id: true, featured: true, slug: true },
  });
  if (!item) throw new Error("Not found");

  if (!item.featured) {
    await setExclusiveFeatured(id);
  } else {
    await db
      .update(posts)
      .set({ featured: false, updatedAt: new Date() })
      .where(eq(posts.id, id));
  }

  revalidateBlogPaths([item.slug]);
}
