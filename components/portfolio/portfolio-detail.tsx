import { IconBrandGithub, IconExternalLink } from "@tabler/icons-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ImageGallery } from "./image-gallery";
import { MarkdownRenderer } from "./markdown-renderer";

interface PortfolioImage {
  id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
}

interface PortfolioDetailProps {
  item: {
    title: string;
    shortDescription: string;
    fullDescription: string;
    thumbnailUrl: string | null;
    techStack: string[] | null;
    liveUrl: string | null;
    githubUrl: string | null;
    startDate: Date | null;
    endDate: Date | null;
    images: PortfolioImage[];
  };
}

function formatDateRange(start: Date | null, end: Date | null): string | null {
  if (!start) return null;
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const startStr = fmt(start);
  const endStr = end ? fmt(end) : "Present";
  return `${startStr} — ${endStr}`;
}

export async function PortfolioDetail({ item }: PortfolioDetailProps) {
  const t = await getTranslations("detail");
  const dateRange = formatDateRange(item.startDate, item.endDate);
  const tags = item.techStack ?? [];

  return (
    <div className="space-y-6">
      <ImageGallery
        images={item.images}
        thumbnailUrl={item.thumbnailUrl}
        viewLabel={t("viewImage")}
      />

      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {item.title}
          </h1>
          {dateRange && (
            <p className="text-sm text-muted-foreground">{dateRange}</p>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {(item.liveUrl || item.githubUrl) && (
          <div className="flex gap-3">
            {item.liveUrl && (
              <a
                href={item.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <IconExternalLink className="size-4" />
                {t("liveSite")}
              </a>
            )}
            {item.githubUrl && (
              <a
                href={item.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <IconBrandGithub className="size-4" />
                {t("sourceCode")}
              </a>
            )}
          </div>
        )}
      </div>

      <Separator />

      <div>
        <MarkdownRenderer content={item.fullDescription} />
      </div>
    </div>
  );
}
