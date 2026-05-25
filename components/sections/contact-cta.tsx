import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconMail,
} from "@tabler/icons-react";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { SectionWrapper } from "./section-wrapper";

export async function ContactCTA() {
  const t = await getTranslations("contact");

  return (
    <SectionWrapper id="contact">
      <div className="space-y-6 text-center">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {t("heading")}
        </h2>
        <p className="mx-auto max-w-md text-muted-foreground leading-relaxed">
          {t("description")}
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="mailto:hello@example.com"
            className={buttonVariants({ size: "lg" })}
          >
            <IconMail className="size-4" />
            {t("email")}
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
    </SectionWrapper>
  );
}
