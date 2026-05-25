import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PortfolioDetail } from "@/components/portfolio/portfolio-detail";
import {
  getPortfolioBySlug,
  getAllPublishedSlugs,
} from "@/lib/queries/portfolio";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPortfolioBySlug(slug);
  if (!item) return {};

  return {
    title: item.title,
    description: item.shortDescription,
    openGraph: {
      title: item.title,
      description: item.shortDescription,
      images: item.thumbnailUrl ? [{ url: item.thumbnailUrl }] : [],
    },
  };
}

export async function generateStaticParams() {
  return getAllPublishedSlugs();
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getPortfolioBySlug(slug);
  if (!item) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/#portfolio"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <IconArrowLeft className="size-4" />
          Back to portfolio
        </Link>
        <PortfolioDetail item={item} />
      </main>
      <SiteFooter />
    </>
  );
}
