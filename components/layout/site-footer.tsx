import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconMail,
} from "@tabler/icons-react";

const socialLinks = [
  { href: "mailto:hello@example.com", icon: IconMail, label: "Email" },
  { href: "https://linkedin.com/in/", icon: IconBrandLinkedin, label: "LinkedIn" },
  { href: "https://github.com/", icon: IconBrandGithub, label: "GitHub" },
];

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Kim Hwanhoon
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
