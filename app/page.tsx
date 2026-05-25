import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/sections/hero";
import { PortfolioSection } from "@/components/sections/portfolio-section";
import { AboutSection } from "@/components/sections/about-section";
import { ContactCTA } from "@/components/sections/contact-cta";
import { getPublishedPortfolioItems } from "@/lib/queries/portfolio";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Kim Hwanhoon",
  jobTitle: "Frontend Developer",
  description: "I craft web experiences that just work.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://kimhwanhoon.com",
};

export default async function HomePage() {
  const items = await getPublishedPortfolioItems();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main id="main">
        <HeroSection />
        <PortfolioSection items={items} />
        <AboutSection />
        <ContactCTA />
      </main>
      <SiteFooter />
    </>
  );
}
