import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionWrapper({
  id,
  children,
  className,
}: SectionWrapperProps) {
  return (
    <section id={id} className={cn("py-20 px-6 md:py-28", className)}>
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  );
}
