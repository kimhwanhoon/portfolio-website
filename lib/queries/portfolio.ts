import { db } from "@/lib/db";
import { portfolioItems, images } from "@/lib/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";

export async function getPublishedPortfolioItems() {
  return db.query.portfolioItems.findMany({
    where: eq(portfolioItems.status, "published"),
    orderBy: [desc(portfolioItems.featured), asc(portfolioItems.sortOrder)],
    with: {
      images: {
        orderBy: [asc(images.sortOrder)],
        limit: 1,
      },
    },
  });
}

export async function getPortfolioBySlug(slug: string) {
  return db.query.portfolioItems.findFirst({
    where: and(
      eq(portfolioItems.slug, slug),
      eq(portfolioItems.status, "published")
    ),
    with: {
      images: {
        orderBy: [asc(images.sortOrder)],
      },
    },
  });
}

export async function getAllPublishedSlugs() {
  const items = await db
    .select({ slug: portfolioItems.slug })
    .from(portfolioItems)
    .where(eq(portfolioItems.status, "published"));
  return items.map((i) => ({ slug: i.slug }));
}
