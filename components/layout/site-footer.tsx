import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconMail,
} from "@tabler/icons-react";
import { getTranslations } from "next-intl/server";
import { siteLinks } from "@/lib/config/links";

const socialLinks = [
  { href: siteLinks.email, icon: IconMail, label: "Email" },
  { href: siteLinks.linkedin, icon: IconBrandLinkedin, label: "LinkedIn" },
  { href: siteLinks.github, icon: IconBrandGithub, label: "GitHub" },
];

export async function SiteFooter(): Promise<React.ReactElement> {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
        <p className="text-sm text-muted-foreground">
          {t("copyright", { year })}
        </p>
        <div className="flex items-center gap-4">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label={link.label}
            >
              <link.icon className="size-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
