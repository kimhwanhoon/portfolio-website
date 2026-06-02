import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AboutSection } from "@/components/sections/about-section";
import { ContactCTA } from "@/components/sections/contact-cta";
import { HeroSection } from "@/components/sections/hero";
import { PortfolioSection } from "@/components/sections/portfolio-section";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/i18n/metadata";
import { getPublishedPortfolioItems } from "@/lib/queries/portfolio";
import { jsonLdScript, personJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { buildOpenGraphLocaleFields, ogImageFields } from "@/lib/seo/og";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const alternates = buildAlternates(locale as Locale, "");
  const canonical = alternates.canonical as string;
  const { openGraphImages, twitterImage } = ogImageFields(
    locale as Locale,
    "",
    t("title"),
  );

  return {
    // Home title is already a full title ("Kim Hwanhoon | Frontend Developer").
    // Use `absolute` so the parent layout's "%s | Kim Hwanhoon" template is not
    // applied on top, which would duplicate the name.
    title: { absolute: t("title") },
    description: t("description"),
    alternates,
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: canonical,
      type: "website",
      ...buildOpenGraphLocaleFields(locale as Locale),
      images: [...openGraphImages],
    },
    twitter: {
      title: t("title"),
      description: t("description"),
      images: [twitterImage],
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const items = await getPublishedPortfolioItems(locale as Locale);
  const [person, website] = await Promise.all([
    personJsonLd(locale as Locale),
    Promise.resolve(websiteJsonLd()),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([person, website])}
      />
      <SiteHeader />
      <main id="main">
        <HeroSection />
        <PortfolioSection items={items} locale={locale} />
        <AboutSection locale={locale} />
        <ContactCTA />
      </main>
      <SiteFooter />
    </>
  );
}
