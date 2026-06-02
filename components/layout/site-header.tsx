"use client";

import { useAuth } from "@clerk/nextjs";
import { IconMenu2, IconSettings, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const t = useTranslations("nav");
  const tHero = useTranslations("hero");
  const locale = useLocale();

  const navLinks = [
    { label: t("portfolio"), href: `/${locale}#portfolio` },
    { label: t("blog"), href: `/${locale}/blog` },
    { label: t("about"), href: `/${locale}/about` },
    { label: t("contact"), href: `/${locale}#contact` },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          href={`/${locale}`}
          className="font-heading text-sm font-semibold tracking-tight"
        >
          {tHero("name")}
        </Link>

        <div className="hidden items-center gap-2 sm:flex">
          <nav className="flex items-center gap-6">
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
                {t("admin")}
              </Link>
            )}
          </nav>
          <LocaleSwitcher />
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-1 sm:hidden">
          <LocaleSwitcher />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn("text-muted-foreground")}
            aria-label={open ? t("closeMenu") : t("openMenu")}
          >
            {open ? (
              <IconX className="size-5" />
            ) : (
              <IconMenu2 className="size-5" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t bg-background sm:hidden"
          >
            <div className="flex flex-col gap-3 px-6 py-4">
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
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
