import { SectionWrapper } from "./section-wrapper";
import { Badge } from "@/components/ui/badge";

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

export function AboutSection() {
  return (
    <SectionWrapper id="about" className="bg-zinc-50">
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="space-y-4">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            About
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              I&apos;m a frontend developer who focuses on building clean,
              performant, and accessible web applications. I care deeply about
              user experience and believe that great interfaces should feel
              invisible.
            </p>
            <p>
              With experience across the full JavaScript ecosystem, I enjoy
              turning complex requirements into simple, elegant solutions. When
              I&apos;m not coding, I&apos;m exploring new tools and
              contributing to the developer community.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-heading text-lg font-semibold tracking-tight">
            Skills & Technologies
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
