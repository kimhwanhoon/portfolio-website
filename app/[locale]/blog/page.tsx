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
import { buildAlternates } from "@/lib/i18n/metadata";
import {
  getAllTagsWithCounts,
  getFeaturedPost,
  getPublishedPostsPaginated,
} from "@/lib/queries/post";
import { blogJsonLd, jsonLdScript } from "@/lib/seo/json-ld";
import { buildOpenGraphLocaleFields, ogImageFields } from "@/lib/seo/og";
import { SITE_URL } from "@/lib/site-config";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string; page?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { tag, page: pageParam } = await searchParams;
  const t = await getTranslations({ locale, namespace: "blog" });

  const requestedPage = Number.parseInt(pageParam ?? "1", 10);
  const page =
    Number.isFinite(requestedPage) && requestedPage > 1 ? requestedPage : 1;

  let alternates = buildAlternates(locale as Locale, "/blog");
  let canonical = alternates.canonical as string;
  let robots: Metadata["robots"];

  if (tag) {
    canonical = `${SITE_URL}/${locale}/blog`;
    alternates = { ...alternates, canonical };
    robots = { index: false, follow: true };
  } else if (page > 1) {
    canonical = `${SITE_URL}/${locale}/blog?page=${page}`;
    alternates = { ...alternates, canonical };
  }

  const { openGraphImages, twitterImage } = ogImageFields(
    locale as Locale,
    "/blog",
    t("heading"),
  );

  return {
    title: t("heading"),
    description: t("subtitle"),
    alternates,
    ...(robots ? { robots } : {}),
    openGraph: {
      title: t("heading"),
      description: t("subtitle"),
      url: canonical,
      type: "website",
      ...buildOpenGraphLocaleFields(locale as Locale),
      images: [...openGraphImages],
    },
    twitter: {
      title: t("heading"),
      description: t("subtitle"),
      images: [twitterImage],
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

  const blogSchema = await blogJsonLd(locale as Locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(blogSchema)}
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
