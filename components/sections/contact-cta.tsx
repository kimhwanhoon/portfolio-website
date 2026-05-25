import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconMail,
} from "@tabler/icons-react";
import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/motion/fade-in";
import { buttonVariants } from "@/components/ui/button";
import { siteLinks } from "@/lib/config/links";
import { SectionWrapper } from "./section-wrapper";

export async function ContactCTA() {
  const t = await getTranslations("contact");

  return (
    <SectionWrapper id="contact">
      <FadeIn>
        <div className="space-y-6 text-center">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {t("heading")}
          </h2>
          <p className="mx-auto max-w-md leading-relaxed text-muted-foreground">
            {t("description")}
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={siteLinks.email}
              className={buttonVariants({ size: "lg" })}
            >
              <IconMail className="size-4" />
              {t("email")}
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
        </div>
      </FadeIn>
    </SectionWrapper>
  );
}
