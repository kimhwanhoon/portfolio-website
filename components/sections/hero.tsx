import { buttonVariants } from "@/components/ui/button";
import {
  IconMail,
  IconBrandLinkedin,
  IconBrandGithub,
} from "@tabler/icons-react";

export function HeroSection() {
  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] items-center px-6">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
              Frontend Developer
            </p>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Kim Hwanhoon
            </h1>
          </div>
          <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
            I craft web experiences that just work.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:hello@example.com"
              className={buttonVariants({ size: "lg" })}
            >
              <IconMail className="size-4" />
              Get in Touch
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
      </div>
    </section>
  );
}
