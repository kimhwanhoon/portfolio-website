import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ScaleOnHover } from "@/components/motion/scale-on-hover";
import { Badge } from "@/components/ui/badge";

interface PortfolioCardProps {
  slug: string;
  title: string;
  shortDescription: string;
  thumbnailUrl: string | null;
  techStack: string[] | null;
  locale: string;
}

export async function PortfolioCard({
  slug,
  title,
  shortDescription,
  thumbnailUrl,
  techStack,
  locale,
}: PortfolioCardProps) {
  const t = await getTranslations("portfolio");
  const tags = techStack ?? [];
  const visibleTags = tags.slice(0, 3);
  const extraCount = tags.length - visibleTags.length;

  return (
    <ScaleOnHover>
      <Link
        href={`/${locale}/portfolio/${slug}`}
        className="group block overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-lg"
      >
        <div className="relative aspect-video overflow-hidden bg-zinc-100">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {t("noImage")}
            </div>
          )}
        </div>
        <div className="space-y-2 p-5">
          <h3 className="font-heading text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
            {title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {shortDescription}
          </p>
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {visibleTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {extraCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  +{extraCount}
                </Badge>
              )}
            </div>
          )}
        </div>
      </Link>
    </ScaleOnHover>
  );
}
