import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconMail,
} from "@tabler/icons-react";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";

export async function HeroSection() {
  const t = await getTranslations("hero");

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] items-center px-6">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
              {t("label")}
            </p>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t("name")}
            </h1>
          </div>
          <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {t("tagline")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:hello@example.com"
              className={buttonVariants({ size: "lg" })}
            >
              <IconMail className="size-4" />
              {t("cta")}
            </a>
            <a
              href="https://linkedin.com/in/"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <IconBrandLinkedin className="size-4" />
              {t("linkedin")}
            </a>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <IconBrandGithub className="size-4" />
              {t("github")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
