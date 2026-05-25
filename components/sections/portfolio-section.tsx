import { getTranslations } from "next-intl/server";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { SectionWrapper } from "./section-wrapper";

interface PortfolioItem {
  slug: string;
  title: string;
  shortDescription: string;
  thumbnailUrl: string | null;
  techStack: string[] | null;
}

interface PortfolioSectionProps {
  items: PortfolioItem[];
  locale: string;
}

export async function PortfolioSection({
  items,
  locale,
}: PortfolioSectionProps) {
  const t = await getTranslations("portfolio");

  return (
    <SectionWrapper id="portfolio">
      <div className="space-y-10">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {t("heading")}
        </h2>
        <PortfolioGrid items={items} locale={locale} />
      </div>
    </SectionWrapper>
  );
}
