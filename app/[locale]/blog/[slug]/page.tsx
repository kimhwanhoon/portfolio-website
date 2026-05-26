import { IconArrowLeft } from "@tabler/icons-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PostContent } from "@/components/blog/post-content";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/i18n/routing";
import { getAllPublishedPostSlugs, getPostBySlug } from "@/lib/queries/post";

function formatDate(date: Date | null, fallback: Date) {
  const d = date ?? fallback;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug, locale as Locale);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
    },
  };
}

export async function generateStaticParams() {
  return getAllPublishedPostSlugs();
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("blog");
  const post = await getPostBySlug(slug, locale as Locale);
  if (!post) notFound();

  const displayDate = formatDate(post.publishedAt, post.updatedAt);

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-5xl px-6 pt-10 md:pt-16">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <IconArrowLeft className="size-4" />
            {t("backToBlog")}
          </Link>
        </div>

        <header className="mx-auto max-w-5xl px-6 pt-10 pb-8">
          {post.tags.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link key={tag.slug} href={`/${locale}/blog?tag=${tag.slug}`}>
                  <Badge variant="secondary">{tag.name}</Badge>
                </Link>
              ))}
            </div>
          )}
          <h1 className="font-heading text-4xl font-bold tracking-tight leading-[1.1] md:text-6xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
              {post.excerpt}
            </p>
          )}
          <div className="mt-4 flex items-end justify-end gap-3 border-t border-border py-4 text-sm text-muted-foreground">
            <span>{displayDate}</span>
            <span aria-hidden="true">·</span>
            <span>{t("readMin", { minutes: post.readingMinutes })}</span>
          </div>
        </header>

        {post.coverImageUrl && (
          <figure className="mx-auto mb-12 max-w-5xl px-0 md:mb-16 md:px-6">
            <div className="relative aspect-16/9 overflow-hidden bg-muted md:rounded-2xl">
              <Image
                src={post.coverImageUrl}
                alt={post.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1100px"
              />
            </div>
          </figure>
        )}

        <div className="mx-auto max-w-3xl px-6 pb-16 md:pb-24">
          <PostContent html={post.contentHtml} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
