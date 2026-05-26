"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
}

function getPageNumbers(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("ellipsis");

  pages.push(total);
  return pages;
}

export function Pagination({ page, totalPages }: PaginationProps) {
  const t = useTranslations("blog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <nav
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
      aria-label={t("paginationLabel")}
    >
      <button
        type="button"
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        className={cn(
          "rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          page <= 1
            ? "cursor-not-allowed opacity-40"
            : "hover:border-foreground hover:text-foreground",
        )}
      >
        {t("previous")}
      </button>

      {pageNumbers.map((num, i) =>
        num === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={num}
            type="button"
            onClick={() => goToPage(num)}
            aria-current={num === page ? "page" : undefined}
            className={cn(
              "min-w-9 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              num === page
                ? "border-foreground bg-foreground text-background"
                : "hover:border-foreground hover:text-foreground",
            )}
          >
            {num}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        className={cn(
          "rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          page >= totalPages
            ? "cursor-not-allowed opacity-40"
            : "hover:border-foreground hover:text-foreground",
        )}
      >
        {t("next")}
      </button>
    </nav>
  );
}
