import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function HomeLoading() {
  return (
    <>
      <SiteHeader />
      <main id="main" aria-busy="true" aria-live="polite">
        <section className="relative flex min-h-[calc(100vh-3.5rem)] items-center px-6">
          <div className="mx-auto w-full max-w-5xl">
            <div className="max-w-2xl space-y-6">
              <div className="h-4 w-40 animate-pulse rounded bg-zinc-200" />
              <div className="space-y-3">
                <div className="h-12 w-3/4 animate-pulse rounded bg-zinc-200" />
                <div className="h-12 w-2/3 animate-pulse rounded bg-zinc-200" />
              </div>
              <div className="h-5 w-full max-w-md animate-pulse rounded bg-zinc-200" />
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="h-11 w-32 animate-pulse rounded-md bg-zinc-200" />
                <div className="h-11 w-32 animate-pulse rounded-md bg-zinc-200" />
                <div className="h-11 w-32 animate-pulse rounded-md bg-zinc-200" />
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-5xl space-y-10 px-6 py-20">
          <div className="h-7 w-40 animate-pulse rounded bg-zinc-200" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {["a", "b", "c"].map((key) => (
              <div key={key} className="overflow-hidden rounded-xl border">
                <div className="aspect-video animate-pulse bg-zinc-200" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-zinc-200" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
