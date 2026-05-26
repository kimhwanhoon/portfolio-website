"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Locale, localeNames, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface LocaleSwitcherProps {
  className?: string;
}

/** Replace the locale prefix in the current pathname. */
function withLocale(pathname: string, target: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${target}`;
  const [first, ...rest] = segments;
  if ((routing.locales as readonly string[]).includes(first)) {
    return `/${[target, ...rest].join("/")}`;
  }
  return `/${[target, ...segments].join("/")}`;
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const current = useLocale() as Locale;
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={current}
      onValueChange={(value) => {
        if (typeof value !== "string" || value === current) return;
        startTransition(() => {
          router.replace(withLocale(pathname, value as Locale));
        });
      }}
      disabled={isPending}
    >
      <SelectTrigger
        size="sm"
        aria-label="Language"
        className={cn("h-8 px-2 text-xs font-medium uppercase", className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {routing.locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {localeNames[locale]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
