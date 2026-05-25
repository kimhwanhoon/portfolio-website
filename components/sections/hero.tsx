import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconMail,
} from "@tabler/icons-react";
import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/motion/fade-in";
import { GradientMesh } from "@/components/motion/gradient-mesh";
import { buttonVariants } from "@/components/ui/button";
import { siteLinks } from "@/lib/config/links";

export async function HeroSection() {
  const t = await getTranslations("hero");

  return (
    <section className="relative flex min-h-[calc(100vh-3.5rem)] items-center px-6">
      <GradientMesh />
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl space-y-6">
          <FadeIn delay={0}>
            <div className="space-y-2">
              <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
                {t("label")}
              </p>
              <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {t("name")}
              </h1>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {t("tagline")}
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={siteLinks.email}
                className={buttonVariants({ size: "lg" })}
              >
                <IconMail className="size-4" />
                {t("cta")}
              </a>
              <a
                href={siteLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                <IconBrandLinkedin className="size-4" />
                {t("linkedin")}
              </a>
              <a
                href={siteLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                <IconBrandGithub className="size-4" />
                {t("github")}
              </a>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
