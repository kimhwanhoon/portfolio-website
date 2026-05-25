import { IconArrowLeft } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CareerTimeline } from "@/components/about/career-timeline";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionWrapper } from "@/components/sections/section-wrapper";
import { Badge } from "@/components/ui/badge";
import { routing } from "@/i18n/routing";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aboutPage" });
  return {
    title: t("title"),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("aboutPage");
  const tAbout = await getTranslations("about");

  const extendedBio = t.raw("extendedBio") as Record<string, string>;
  const timeline = t.raw("timeline") as Record<
    string,
    { date: string; title: string; company: string; description: string }
  >;

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href={`/${locale}`}
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <IconArrowLeft className="size-4" />
          {t("backToHome")}
        </Link>

        <SectionWrapper>
          <div className="space-y-4">
            <h1 className="font-heading text-3xl font-bold tracking-tight">
              {t("title")}
            </h1>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {Object.values(extendedBio).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <div className="space-y-3 pt-4">
              <h2 className="font-heading text-lg font-semibold tracking-tight">
                {tAbout("skillsHeading")}
              </h2>
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

        <SectionWrapper>
          <div className="space-y-8">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              {t("experienceHeading")}
            </h2>
            <CareerTimeline entries={Object.values(timeline)} />
          </div>
        </SectionWrapper>
      </main>
      <SiteFooter />
    </>
  );
}
