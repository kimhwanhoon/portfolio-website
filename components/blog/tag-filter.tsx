"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface TagFilterProps {
  tags: { slug: string; name: string; count: number }[];
  activeTag?: string;
}

export function TagFilter({ tags, activeTag }: TagFilterProps) {
  const t = useTranslations("blog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setTag(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (slug) {
      params.set("tag", slug);
    } else {
      params.delete("tag");
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  if (tags.length === 0) return null;

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label={t("filterByTag")}
    >
      <button
        type="button"
        onClick={() => setTag(null)}
        aria-pressed={!activeTag}
        className={cn(
          "rounded-full border px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          !activeTag
            ? "border-foreground bg-foreground text-background"
            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
        )}
      >
        {t("allTags")}
      </button>
      {tags.map((tag) => (
        <button
          key={tag.slug}
          type="button"
          onClick={() => setTag(tag.slug)}
          aria-pressed={activeTag === tag.slug}
          className={cn(
            "rounded-full border px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            activeTag === tag.slug
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
          )}
        >
          {tag.name}
          {tag.count > 0 && (
            <span className="ml-1 opacity-60">({tag.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}
