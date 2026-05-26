import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";

export default function PortfolioNotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
          Not found
        </p>
        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          This project doesn&apos;t exist
        </h1>
        <p className="mt-3 text-muted-foreground">
          It may have been unpublished or the link is incorrect.
        </p>
        <Link
          href="/"
          className={`${buttonVariants({ variant: "outline" })} mt-8`}
        >
          <IconArrowLeft className="size-4" />
          Back to portfolio
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
