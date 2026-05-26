"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { type Locale, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const CONTENT_LOCALES = routing.locales;

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

type LocaleTabsProps = {
  defaultLocale?: Locale;
  children: (locale: Locale) => React.ReactNode;
};

export function LocaleTabs({
  defaultLocale = "en",
  children,
}: LocaleTabsProps) {
  const [active, setActive] = useState<Locale>(defaultLocale);

  return (
    <div className="space-y-4">
      <div
        className="flex gap-1 border-b border-border"
        role="tablist"
        aria-label="Content language"
      >
        {CONTENT_LOCALES.map((locale) => (
          <button
            key={locale}
            type="button"
            role="tab"
            aria-selected={active === locale}
            onClick={() => setActive(locale)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active === locale
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {LOCALE_LABELS[locale]}
            {locale !== "en" && (
              <Badge variant="secondary" className="text-xs font-normal">
                Optional
              </Badge>
            )}
          </button>
        ))}
      </div>
      {CONTENT_LOCALES.map((locale) => (
        <div
          key={locale}
          role="tabpanel"
          hidden={active !== locale}
          className={active === locale ? "space-y-4" : undefined}
        >
          {children(locale)}
        </div>
      ))}
    </div>
  );
}
