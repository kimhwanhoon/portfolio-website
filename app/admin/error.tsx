"use client";

import { IconRefresh } from "@tabler/icons-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          Something went wrong
        </h2>
        <p className="text-sm text-zinc-500">
          {error.message || "Unknown error"}
        </p>
        {error.digest && (
          <p className="text-xs text-zinc-400">Digest: {error.digest}</p>
        )}
      </div>
      <Button onClick={reset} size="sm">
        <IconRefresh className="size-4" />
        Try again
      </Button>
    </div>
  );
}
