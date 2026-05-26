import { IconArrowLeft } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CareerTimeline } from "@/components/about/career-timeline";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionWrapper } from "@/components/sections/section-wrapper";
import { Badge } from "@/components/ui/badge";
import { type Locale, routing } from "@/i18n/routing";
import { skills } from "@/lib/config/skills";
import { buildAlternates } from "@/lib/i18n/metadata";
import {
  breadcrumbJsonLd,
  jsonLdScript,
  personJsonLd,
} from "@/lib/seo/json-ld";
import { buildOpenGraphLocaleFields, ogImageFields } from "@/lib/seo/og";
import { SITE_AUTHOR } from "@/lib/site-config";

function truncateDescription(text: string, max = 160): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  const tMeta = await getTranslations({ locale, namespace: "meta" });
  const extendedBio = t.raw("extendedBio") as Record<string, string>;
  const description = truncateDescription(
    extendedBio["0"] ?? tMeta("description"),
  );
  const alternates = buildAlternates(locale as Locale, "/about");
  const canonical = alternates.canonical as string;
  const { openGraphImages, twitterImage } = ogImageFields(
    locale as Locale,
    "/about",
    `${t("title")} | ${SITE_AUTHOR}`,
  );

  return {
    title: t("title"),
    description,
    alternates,
    openGraph: {
      title: t("title"),
      description,
      url: canonical,
      type: "profile",
      ...buildOpenGraphLocaleFields(locale as Locale),
      images: [...openGraphImages],
    },
    twitter: {
      title: t("title"),
      description,
      images: [twitterImage],
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("aboutPage");
  const tAbout = await getTranslations("about");
  const tCommon = await getTranslations("common");

  const extendedBio = t.raw("extendedBio") as Record<string, string>;
  const timeline = t.raw("timeline") as Record<
    string,
    { date: string; title: string; company: string; description: string }
  >;

  const person = await personJsonLd(locale as Locale);
  const breadcrumbs = breadcrumbJsonLd([
    { name: tCommon("home"), href: `/${locale}` },
    { name: t("title"), href: `/${locale}/about` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([person, breadcrumbs])}
      />
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href={`/${locale}`}
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <IconArrowLeft className="size-4" />
          {t("backToHome")}
        </Link>

        <SectionWrapper>
          <div className="space-y-4">
            <h1 className="font-heading text-3xl font-bold tracking-tight">
              {t("title")}
            </h1>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {Object.values(extendedBio).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <div className="space-y-3 pt-4">
              <h2 className="font-heading text-lg font-semibold tracking-tight">
                {tAbout("skillsHeading")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </SectionWrapper>

        <SectionWrapper>
          <div className="space-y-8">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              {t("experienceHeading")}
            </h2>
            <CareerTimeline entries={Object.values(timeline)} />
          </div>
        </SectionWrapper>
      </main>
      <SiteFooter />
    </>
  );
}
