import { SectionWrapper } from "./section-wrapper";
import { buttonVariants } from "@/components/ui/button";
import {
  IconMail,
  IconBrandLinkedin,
  IconBrandGithub,
} from "@tabler/icons-react";

export function ContactCTA() {
  return (
    <SectionWrapper id="contact">
      <div className="text-center space-y-6">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Let&apos;s Connect
        </h2>
        <p className="mx-auto max-w-md text-muted-foreground leading-relaxed">
          I&apos;m always open to new opportunities and interesting
          conversations. Feel free to reach out.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="mailto:hello@example.com"
            className={buttonVariants({ size: "lg" })}
          >
            <IconMail className="size-4" />
            Email Me
          </a>
          <a
            href="https://linkedin.com/in/"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            <IconBrandLinkedin className="size-4" />
            LinkedIn
          </a>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            <IconBrandGithub className="size-4" />
            GitHub
          </a>
        </div>
      </div>
    </SectionWrapper>
  );
}
