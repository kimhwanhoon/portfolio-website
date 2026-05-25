import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { SectionWrapper } from "./section-wrapper";

const skills = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
  "PostgreSQL",
  "REST APIs",
  "Git",
];

interface AboutSectionProps {
  locale: string;
}

export async function AboutSection({ locale }: AboutSectionProps) {
  const t = await getTranslations("about");
  const bio = t.raw("bio") as Record<string, string>;

  return (
    <SectionWrapper id="about" className="bg-zinc-50">
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="space-y-4">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {t("heading")}
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            {Object.values(bio).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <Link
            href={`/${locale}/about`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            {t("learnMore")}
            <IconArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="space-y-4">
          <h3 className="font-heading text-lg font-semibold tracking-tight">
            {t("skillsHeading")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-sm">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
