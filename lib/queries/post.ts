import { and, asc, count, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { db } from "@/lib/db";
import { posts, postTags, postTranslations, tags } from "@/lib/db/schema";
import { coalesceTranslation, DEFAULT_LOCALE } from "@/lib/db/translations";
import type { PostTranslationFields } from "@/lib/validators/post";

export type PostTag = { slug: string; name: string };

export type PostListItem = {
  id: string;
  slug: string;
  coverImageUrl: string | null;
  featured: boolean;
  readingMinutes: number;
  publishedAt: Date | null;
  updatedAt: Date;
  title: string;
  excerpt: string;
  tags: PostTag[];
};

const postT = postTranslations;
const postTEn = alias(postTranslations, "post_translations_en");

function postTranslationSelect() {
  return {
    title: coalesceTranslation(postT.title, postTEn.title),
    excerpt: coalesceTranslation(postT.excerpt, postTEn.excerpt),
  };
}

function postTranslationJoins(locale: Locale) {
  return {
    innerJoinEn: {
      table: postTEn,
      on: and(eq(postTEn.postId, posts.id), eq(postTEn.locale, DEFAULT_LOCALE)),
    },
    leftJoinLocale: {
      table: postT,
      on: and(eq(postT.postId, posts.id), eq(postT.locale, locale)),
    },
  };
}

function mapTags(rows: { slug: string; name: string }[]): PostTag[] {
  return rows;
}

async function attachTagsToPosts<T extends { id: string }>(
  items: T[],
): Promise<(T & { tags: PostTag[] })[]> {
  if (items.length === 0) return [];

  const postIds = items.map((i) => i.id);
  const tagRows = await db
    .select({
      postId: postTags.postId,
      slug: tags.slug,
      name: tags.name,
    })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(inArray(postTags.postId, postIds));

  const tagsByPost = new Map<string, PostTag[]>();
  for (const row of tagRows) {
    const existing = tagsByPost.get(row.postId) ?? [];
    existing.push({ slug: row.slug, name: row.name });
    tagsByPost.set(row.postId, existing);
  }

  return items.map((item) => ({
    ...item,
    tags: tagsByPost.get(item.id) ?? [],
  }));
}

export async function getPublishedPosts(
  locale: Locale = routing.defaultLocale,
  tagSlug?: string,
): Promise<PostListItem[]> {
  const joins = postTranslationJoins(locale);

  const baseQuery = db
    .select({
      id: posts.id,
      slug: posts.slug,
      coverImageUrl: posts.coverImageUrl,
      featured: posts.featured,
      readingMinutes: posts.readingMinutes,
      publishedAt: posts.publishedAt,
      updatedAt: posts.updatedAt,
      ...postTranslationSelect(),
    })
    .from(posts)
    .innerJoin(joins.innerJoinEn.table, joins.innerJoinEn.on)
    .leftJoin(joins.leftJoinLocale.table, joins.leftJoinLocale.on)
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt), desc(posts.createdAt));

  let rows = await baseQuery;

  if (tagSlug) {
    const taggedPostIds = await db
      .select({ postId: postTags.postId })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(tags.slug, tagSlug));

    const idSet = new Set(taggedPostIds.map((r) => r.postId));
    rows = rows.filter((r) => idSet.has(r.id));
  }

  return attachTagsToPosts(rows);
}

export async function getFeaturedPost(
  locale: Locale = routing.defaultLocale,
): Promise<PostListItem | null> {
  const joins = postTranslationJoins(locale);

  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      coverImageUrl: posts.coverImageUrl,
      featured: posts.featured,
      readingMinutes: posts.readingMinutes,
      publishedAt: posts.publishedAt,
      updatedAt: posts.updatedAt,
      ...postTranslationSelect(),
    })
    .from(posts)
    .innerJoin(joins.innerJoinEn.table, joins.innerJoinEn.on)
    .leftJoin(joins.leftJoinLocale.table, joins.leftJoinLocale.on)
    .where(and(eq(posts.status, "published"), eq(posts.featured, true)))
    .limit(1);

  const item = rows[0];
  if (!item) return null;

  const withTags = await attachTagsToPosts([item]);
  return withTags[0] ?? null;
}

export async function getPostBySlug(
  slug: string,
  locale: Locale = routing.defaultLocale,
) {
  const joins = postTranslationJoins(locale);

  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      coverImageUrl: posts.coverImageUrl,
      featured: posts.featured,
      readingMinutes: posts.readingMinutes,
      publishedAt: posts.publishedAt,
      updatedAt: posts.updatedAt,
      createdAt: posts.createdAt,
      title: coalesceTranslation(postT.title, postTEn.title),
      excerpt: coalesceTranslation(postT.excerpt, postTEn.excerpt),
      contentHtml: coalesceTranslation(postT.contentHtml, postTEn.contentHtml),
    })
    .from(posts)
    .innerJoin(joins.innerJoinEn.table, joins.innerJoinEn.on)
    .leftJoin(joins.leftJoinLocale.table, joins.leftJoinLocale.on)
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .limit(1);

  const item = rows[0];
  if (!item) return null;

  const withTags = await attachTagsToPosts([item]);
  return withTags[0] ?? null;
}

export const BLOG_PAGE_SIZE = 9;

export type PaginatedPosts = {
  items: PostListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export async function getPublishedPostsPaginated({
  locale = routing.defaultLocale,
  tagSlug,
  page = 1,
  perPage = BLOG_PAGE_SIZE,
  excludeFeaturedId,
}: {
  locale?: Locale;
  tagSlug?: string;
  page?: number;
  perPage?: number;
  excludeFeaturedId?: string | null;
}): Promise<PaginatedPosts> {
  const joins = postTranslationJoins(locale);
  const conditions = [eq(posts.status, "published")];

  if (excludeFeaturedId) {
    conditions.push(ne(posts.id, excludeFeaturedId));
  }

  if (tagSlug) {
    const taggedPostIds = await db
      .select({ postId: postTags.postId })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(tags.slug, tagSlug));

    const idSet = taggedPostIds.map((r) => r.postId);
    if (idSet.length === 0) {
      return { items: [], total: 0, page: 1, perPage, totalPages: 0 };
    }
    conditions.push(inArray(posts.id, idSet));
  }

  const whereClause = and(...conditions);

  const [{ total }] = await db
    .select({ total: count() })
    .from(posts)
    .innerJoin(joins.innerJoinEn.table, joins.innerJoinEn.on)
    .leftJoin(joins.leftJoinLocale.table, joins.leftJoinLocale.on)
    .where(whereClause);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const offset = (safePage - 1) * perPage;

  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      coverImageUrl: posts.coverImageUrl,
      featured: posts.featured,
      readingMinutes: posts.readingMinutes,
      publishedAt: posts.publishedAt,
      updatedAt: posts.updatedAt,
      ...postTranslationSelect(),
    })
    .from(posts)
    .innerJoin(joins.innerJoinEn.table, joins.innerJoinEn.on)
    .leftJoin(joins.leftJoinLocale.table, joins.leftJoinLocale.on)
    .where(whereClause)
    .orderBy(desc(posts.publishedAt), desc(posts.createdAt))
    .limit(perPage)
    .offset(offset);

  const items = await attachTagsToPosts(rows);

  return {
    items,
    total,
    page: safePage,
    perPage,
    totalPages: total === 0 ? 0 : totalPages,
  };
}

export async function getAllPublishedPostSlugs() {
  const items = await db
    .select({ slug: posts.slug })
    .from(posts)
    .where(eq(posts.status, "published"));
  return items.map((i) => ({ slug: i.slug }));
}

export async function getAllTagsWithCounts() {
  const publishedPostIds = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.status, "published"));

  const publishedIds = publishedPostIds.map((p) => p.id);
  if (publishedIds.length === 0) {
    return db
      .select({ slug: tags.slug, name: tags.name })
      .from(tags)
      .orderBy(asc(tags.name))
      .then((rows) => rows.map((r) => ({ ...r, count: 0 })));
  }

  return db
    .select({
      slug: tags.slug,
      name: tags.name,
      count: sql<number>`count(${postTags.postId})::int`,
    })
    .from(tags)
    .leftJoin(
      postTags,
      and(eq(postTags.tagId, tags.id), inArray(postTags.postId, publishedIds)),
    )
    .groupBy(tags.id, tags.slug, tags.name)
    .orderBy(asc(tags.name));
}

export async function getAllPostsForAdmin() {
  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      coverImageUrl: posts.coverImageUrl,
      status: posts.status,
      featured: posts.featured,
      readingMinutes: posts.readingMinutes,
      publishedAt: posts.publishedAt,
      updatedAt: posts.updatedAt,
      title: postTranslations.title,
      excerpt: postTranslations.excerpt,
    })
    .from(posts)
    .innerJoin(
      postTranslations,
      and(
        eq(postTranslations.postId, posts.id),
        eq(postTranslations.locale, DEFAULT_LOCALE),
      ),
    )
    .orderBy(desc(posts.updatedAt));

  return attachTagsToPosts(rows);
}

export type PostEditTranslations = {
  en: PostTranslationFields & { contentJson: Record<string, unknown> };
  fr?: PostTranslationFields & { contentJson: Record<string, unknown> };
};

export async function getPostForEdit(id: string) {
  const item = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: { translations: true },
  });

  if (!item) return null;

  const byLocale = Object.fromEntries(
    item.translations.map((t) => [
      t.locale,
      {
        title: t.title,
        excerpt: t.excerpt,
        contentJson: t.contentJson as Record<string, unknown>,
      },
    ]),
  ) as Record<
    string,
    PostTranslationFields & { contentJson: Record<string, unknown> }
  >;

  const en = byLocale.en;
  if (!en) return null;

  const translations: PostEditTranslations = {
    en,
    ...(byLocale.fr ? { fr: byLocale.fr } : {}),
  };

  const tagRows = await db
    .select({ slug: tags.slug, name: tags.name })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, id));

  return {
    id: item.id,
    slug: item.slug,
    coverImageUrl: item.coverImageUrl,
    status: item.status,
    featured: item.featured,
    readingMinutes: item.readingMinutes,
    publishedAt: item.publishedAt,
    updatedAt: item.updatedAt,
    translations,
    tags: mapTags(tagRows),
  };
}
