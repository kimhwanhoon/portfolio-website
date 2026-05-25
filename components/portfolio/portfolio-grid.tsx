import { PortfolioCard } from "./portfolio-card";

interface PortfolioItem {
  slug: string;
  title: string;
  shortDescription: string;
  thumbnailUrl: string | null;
  techStack: string[] | null;
}

interface PortfolioGridProps {
  items: PortfolioItem[];
}

export function PortfolioGrid({ items }: PortfolioGridProps) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No projects to show yet. Check back soon.
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <PortfolioCard key={item.slug} {...item} />
      ))}
    </div>
  );
}
