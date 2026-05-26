import { getTranslations } from "next-intl/server";
import { type Locale, routing } from "@/i18n/routing";
import { siteLinks } from "@/lib/config/links";
import { absoluteOgImageUrl } from "@/lib/seo/og";
import { SITE_AUTHOR, SITE_URL } from "@/lib/site-config";

export const PERSON_ID = `${SITE_URL}/#person`;

export type BreadcrumbItem = {
  name: string;
  href: string;
};

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.href.startsWith("http")
        ? item.href
        : `${SITE_URL}${item.href}`,
    })),
  };
}

export async function personJsonLd(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "meta" });
  const tHero = await getTranslations({ locale, namespace: "hero" });

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: tHero("name"),
    jobTitle: tHero("label"),
    description: t("description"),
    url: `${SITE_URL}/${locale}`,
    image: absoluteOgImageUrl(locale),
    email: siteLinks.email.replace(/^mailto:/, ""),
    sameAs: [siteLinks.linkedin, siteLinks.github],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_AUTHOR,
    url: SITE_URL,
    inLanguage: routing.locales,
    publisher: { "@id": PERSON_ID },
  };
}

export async function blogJsonLd(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "blog" });
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: t("heading"),
    description: t("subtitle"),
    url: `${SITE_URL}/${locale}/blog`,
    inLanguage: locale,
    publisher: { "@id": PERSON_ID },
  };
}

type ArticleInput = {
  title: string;
  excerpt: string;
  slug: string;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  readingMinutes: number;
  tags: { name: string }[];
  contentHtml: string;
};

export function articleJsonLd(locale: Locale, post: ArticleInput) {
  const url = `${SITE_URL}/${locale}/blog/${post.slug}`;
  const published = post.publishedAt ?? post.createdAt;
  const wordCount = post.contentHtml
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  const images = post.coverImageUrl
    ? [post.coverImageUrl]
    : [absoluteOgImageUrl(locale, `/blog/${post.slug}`)];

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: published.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    inLanguage: locale,
    wordCount,
    timeRequired: `PT${post.readingMinutes}M`,
    keywords: post.tags.map((t) => t.name).join(", "),
    image: images,
    author: { "@type": "Person", "@id": PERSON_ID, name: SITE_AUTHOR },
    publisher: { "@type": "Person", "@id": PERSON_ID, name: SITE_AUTHOR },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };
}

type CreativeWorkInput = {
  title: string;
  shortDescription: string;
  slug: string;
  thumbnailUrl: string | null;
  techStack: string[] | null;
  createdAt: Date;
  updatedAt: Date;
  liveUrl: string | null;
  githubUrl: string | null;
};

export function creativeWorkJsonLd(locale: Locale, item: CreativeWorkInput) {
  const url = `${SITE_URL}/${locale}/portfolio/${item.slug}`;
  const images = item.thumbnailUrl
    ? [item.thumbnailUrl]
    : [absoluteOgImageUrl(locale, `/portfolio/${item.slug}`)];

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: item.title,
    description: item.shortDescription,
    url,
    inLanguage: locale,
    dateCreated: item.createdAt.toISOString(),
    dateModified: item.updatedAt.toISOString(),
    image: images,
    keywords: (item.techStack ?? []).join(", "),
    author: { "@type": "Person", "@id": PERSON_ID, name: SITE_AUTHOR },
    ...(item.liveUrl
      ? { sameAs: [item.liveUrl, item.githubUrl].filter(Boolean) }
      : {}),
  };
}

export function jsonLdScript(data: Record<string, unknown> | unknown[]) {
  if (Array.isArray(data)) {
    const graph = data.map((item) => {
      const node = item as Record<string, unknown>;
      const { "@context": _ctx, ...rest } = node;
      return rest;
    });
    return {
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": graph,
      }),
    };
  }
  return {
    __html: JSON.stringify(data),
  };
}
