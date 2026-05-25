import { getTranslations } from "next-intl/server";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/motion/stagger-children";
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
  locale: string;
}

export async function PortfolioGrid({ items, locale }: PortfolioGridProps) {
  const t = await getTranslations("portfolio");

  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">{t("empty")}</p>
    );
  }

  return (
    <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <StaggerItem key={item.slug}>
          <PortfolioCard {...item} locale={locale} />
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}
