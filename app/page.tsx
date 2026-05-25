import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/sections/hero";
import { PortfolioSection } from "@/components/sections/portfolio-section";
import { AboutSection } from "@/components/sections/about-section";
import { ContactCTA } from "@/components/sections/contact-cta";
import { getPublishedPortfolioItems } from "@/lib/queries/portfolio";

export default async function HomePage() {
  const items = await getPublishedPortfolioItems();

  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <PortfolioSection items={items} />
        <AboutSection />
        <ContactCTA />
      </main>
      <SiteFooter />
    </>
  );
}
