interface TimelineEntry {
  date: string;
  title: string;
  company: string;
  description: string;
}

interface CareerTimelineProps {
  entries: TimelineEntry[];
}

export function CareerTimeline({ entries }: CareerTimelineProps) {
  return (
    <div className="relative space-y-8 pl-8 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-zinc-200">
      {entries.map((entry) => (
        <div key={`${entry.company}-${entry.date}`} className="relative">
          <div className="absolute -left-8 top-1.5 size-[15px] rounded-full border-2 border-zinc-300 bg-white" />
          <p className="text-sm text-muted-foreground">{entry.date}</p>
          <h3 className="font-heading text-base font-semibold mt-1">
            {entry.title}
          </h3>
          <p className="text-sm text-muted-foreground">{entry.company}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {entry.description}
          </p>
        </div>
      ))}
    </div>
  );
}
