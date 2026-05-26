import { IconLoader2 } from "@tabler/icons-react";

export default function AdminLoading() {
  return (
    <div
      className="flex h-64 items-center justify-center"
      aria-busy="true"
      aria-live="polite"
    >
      <IconLoader2 className="size-6 animate-spin text-zinc-400" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
