import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function PortfolioDetailLoading() {
  return (
    <>
      <SiteHeader />
      <main
        className="mx-auto max-w-3xl px-6 py-12"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="mb-8 h-4 w-32 animate-pulse rounded bg-zinc-200" />
        <div className="space-y-6">
          <div className="aspect-video animate-pulse rounded-lg bg-zinc-200" />
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-8 w-2/3 animate-pulse rounded bg-zinc-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <div className="h-6 w-16 animate-pulse rounded bg-zinc-200" />
              <div className="h-6 w-20 animate-pulse rounded bg-zinc-200" />
              <div className="h-6 w-14 animate-pulse rounded bg-zinc-200" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-zinc-200" />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
