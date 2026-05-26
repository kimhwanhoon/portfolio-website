import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { Pagination } from "@/components/blog/pagination";
import { PostGrid } from "@/components/blog/post-grid";
import { PostHero } from "@/components/blog/post-hero";
import { TagFilter } from "@/components/blog/tag-filter";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import type { Locale } from "@/i18n/routing";
import {
  getAllTagsWithCounts,
  getFeaturedPost,
  getPublishedPostsPaginated,
} from "@/lib/queries/post";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kimhwanhoon.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const canonical = `${BASE_URL}/${locale}/blog`;

  return {
    title: t("heading"),
    description: t("subtitle"),
    alternates: { canonical },
    openGraph: {
      title: t("heading"),
      description: t("subtitle"),
      url: canonical,
      type: "website",
    },
  };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const { locale } = await params;
  const { tag: tagSlug, page: pageParam } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations("blog");
  const requestedPage = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isFinite(requestedPage) ? requestedPage : 1;

  const featured = !tagSlug ? await getFeaturedPost(locale as Locale) : null;
  const showHero = Boolean(featured && page <= 1);
  const excludeFeaturedId = featured?.id ?? null;

  const [paginated, tagList] = await Promise.all([
    getPublishedPostsPaginated({
      locale: locale as Locale,
      tagSlug,
      page,
      excludeFeaturedId,
    }),
    getAllTagsWithCounts(),
  ]);

  const hideEmptyState = showHero && paginated.items.length === 0;
  const emptyMessage = tagSlug ? t("emptyForTag") : t("emptyState");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: t("heading"),
    url: `${BASE_URL}/${locale}/blog`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main id="main" className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-10 space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {t("heading")}
          </h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </header>

        {showHero && featured && (
          <section className="mb-12">
            <PostHero post={featured} locale={locale} />
          </section>
        )}

        <section className="mb-8">
          <Suspense fallback={null}>
            <TagFilter tags={tagList} activeTag={tagSlug} />
          </Suspense>
        </section>

        {paginated.items.length === 0 && !hideEmptyState ? (
          <p className="py-16 text-center text-muted-foreground">
            {emptyMessage}
          </p>
        ) : paginated.items.length > 0 ? (
          <>
            <PostGrid posts={paginated.items} locale={locale} />
            <Suspense fallback={null}>
              <Pagination
                page={paginated.page}
                totalPages={paginated.totalPages}
              />
            </Suspense>
          </>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
