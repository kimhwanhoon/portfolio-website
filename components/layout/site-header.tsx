"use client";

import { useAuth } from "@clerk/nextjs";
import { IconMenu2, IconSettings, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const t = useTranslations("nav");
  const tHero = useTranslations("hero");
  const locale = useLocale();

  const navLinks = [
    { label: t("portfolio"), href: "#portfolio" },
    { label: t("about"), href: `/${locale}/about` },
    { label: t("contact"), href: "#contact" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          href={`/${locale}`}
          className="font-heading text-sm font-semibold tracking-tight"
        >
          {tHero("name")}
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          {isSignedIn && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <IconSettings className="size-3.5" />
              Admin
            </Link>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="sm:hidden text-muted-foreground"
          aria-label={open ? t("closeMenu") : t("openMenu")}
        >
          {open ? (
            <IconX className="size-5" />
          ) : (
            <IconMenu2 className="size-5" />
          )}
        </button>
      </div>

      {open && (
        <nav className="border-t bg-white px-6 py-4 sm:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            {isSignedIn && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <IconSettings className="size-3.5" />
                Admin
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
