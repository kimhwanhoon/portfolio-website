import { IconArrowLeft } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PortfolioDetail } from "@/components/portfolio/portfolio-detail";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/i18n/metadata";
import {
  getAllPublishedSlugs,
  getPortfolioBySlug,
} from "@/lib/queries/portfolio";
import {
  breadcrumbJsonLd,
  creativeWorkJsonLd,
  jsonLdScript,
} from "@/lib/seo/json-ld";
import { buildOpenGraphLocaleFields, ogImageFields } from "@/lib/seo/og";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = await getPortfolioBySlug(slug, locale as Locale);
  if (!item) return {};

  const alternates = buildAlternates(locale as Locale, `/portfolio/${slug}`);
  const canonical = alternates.canonical as string;
  const { openGraphImages, twitterImage } = ogImageFields(
    locale as Locale,
    `/portfolio/${slug}`,
    item.title,
  );

  return {
    title: item.title,
    description: item.shortDescription,
    alternates,
    openGraph: {
      title: item.title,
      description: item.shortDescription,
      url: canonical,
      type: "website",
      ...buildOpenGraphLocaleFields(locale as Locale),
      images: [...openGraphImages],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.shortDescription,
      images: [twitterImage],
    },
  };
}

export async function generateStaticParams() {
  return getAllPublishedSlugs();
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("detail");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");
  const item = await getPortfolioBySlug(slug, locale as Locale);
  if (!item) notFound();

  const structuredData = [
    creativeWorkJsonLd(locale as Locale, {
      title: item.title,
      shortDescription: item.shortDescription,
      slug: item.slug,
      thumbnailUrl: item.thumbnailUrl,
      techStack: item.techStack,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      liveUrl: item.liveUrl,
      githubUrl: item.githubUrl,
    }),
    breadcrumbJsonLd([
      { name: tCommon("home"), href: `/${locale}` },
      { name: tNav("portfolio"), href: `/${locale}#portfolio` },
      { name: item.title, href: `/${locale}/portfolio/${slug}` },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(structuredData)}
      />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href={`/${locale}/#portfolio`}
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <IconArrowLeft className="size-4" />
          {t("backToPortfolio")}
        </Link>
        <PortfolioDetail item={item} />
      </main>
      <SiteFooter />
    </>
  );
}
