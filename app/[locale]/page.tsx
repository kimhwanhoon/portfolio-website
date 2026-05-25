import { setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AboutSection } from "@/components/sections/about-section";
import { ContactCTA } from "@/components/sections/contact-cta";
import { HeroSection } from "@/components/sections/hero";
import { PortfolioSection } from "@/components/sections/portfolio-section";
import type { Locale } from "@/i18n/routing";
import { getPublishedPortfolioItems } from "@/lib/queries/portfolio";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Kim Hwanhoon",
  jobTitle: "Frontend Developer",
  description: "I craft web experiences that just work.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://kimhwanhoon.com",
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const items = await getPublishedPortfolioItems(locale as Locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
