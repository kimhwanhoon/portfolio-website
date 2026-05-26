"use client";

import { IconRefresh } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button, buttonVariants } from "@/components/ui/button";

export default function LocaleError({
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
    <>
      <SiteHeader />
      <main
        id="main"
        className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center"
      >
        <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
          Something went wrong
        </p>
        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          We hit an unexpected error.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Please try again. If the problem persists, get in touch and I&apos;ll
          take a look.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset}>
            <IconRefresh className="size-4" />
            Try again
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Back home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
