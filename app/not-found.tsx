import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main
        id="main"
        className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center"
      >
        <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
          404
        </p>
        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className={`${buttonVariants()} mt-8`}>
          Back home
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
