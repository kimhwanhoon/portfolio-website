import { SectionWrapper } from "./section-wrapper";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";

interface PortfolioItem {
  slug: string;
  title: string;
  shortDescription: string;
  thumbnailUrl: string | null;
  techStack: string[] | null;
}

interface PortfolioSectionProps {
  items: PortfolioItem[];
}

export function PortfolioSection({ items }: PortfolioSectionProps) {
  return (
    <SectionWrapper id="portfolio">
      <div className="space-y-10">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Selected Work
        </h2>
        <PortfolioGrid items={items} />
      </div>
    </SectionWrapper>
  );
}
