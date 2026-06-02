---
title: "One URL, Two Experiences: Modals That Survive a Refresh with Next.js Intercepting Routes"
slug: "nextjs-intercepting-routes-modal"
excerpt: "A modal that vanishes when you reload or share its link isn't a page — it's a trap. Here's how I used Next.js parallel and intercepting routes to make my portfolio cards open in a modal on click, yet resolve to a real, shareable, SEO-indexed page on a direct visit — without duplicating a single line of UI."
tags:
  - "Next.js"
  - "App Router"
  - "React"
  - "Frontend"
  - "UX"
---

Click a card on my portfolio and a detail view slides up in a centered modal — the grid stays behind it, your scroll position is intact, and hitting `Esc` drops you right back where you were. Now copy that URL, paste it into a fresh tab, and you get the *same* content rendered as a full standalone page, with its own `<title>`, Open Graph card, and structured data.

Same URL. Two completely different experiences, chosen by **how you arrived**. No query-string hacks, no global `isModalOpen` state, no client-side data refetch. This is one of my favourite features of the Next.js App Router, and it falls out of two conventions working together: **parallel routes** and **intercepting routes**.

## The problem with the "modal as state" approach

The classic way to build this is a boolean somewhere in a store:

```tsx
const [selected, setSelected] = useState<Item | null>(null);
// ...
<Card onClick={() => setSelected(item)} />
{selected && <Modal item={selected} onClose={() => setSelected(null)} />}
```

It works until someone does something reasonable:

- **Reloads the page** while the modal is open → modal disappears, state is gone.
- **Shares the link** → the recipient lands on the grid, not the thing you wanted them to see.
- **Hits back** → the browser leaves the whole page instead of just closing the modal.
- **A crawler visits** → there's no URL to index, so the detail content is invisible to search.

The root issue: the modal isn't addressable. For a portfolio whose entire job is to get a recruiter to *that one project*, an un-shareable detail view is a bug, not a detail.

## The mental model: a slot that the URL fills in

App Router lets a layout render more than one "page" at a time through **parallel routes** — named slots, declared as folders prefixed with `@`. My locale layout has the usual `children` plus a `modal` slot:

```
app/[locale]/
├─ layout.tsx                 # renders {children} AND {modal}
├─ @modal/
│  ├─ default.tsx             # what the slot shows when nothing matches
│  └─ (.)portfolio/[slug]/
│     └─ page.tsx             # the intercepted modal view
└─ portfolio/
   └─ [slug]/
      └─ page.tsx             # the real, standalone detail page
```

The layout receives the slot as a prop and drops it next to the page:

```tsx
export default async function LocaleLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider>
      {children}
      {modal}
    </NextIntlClientProvider>
  );
}
```

Two things share the screen. `children` is the page you're on (the grid). `modal` is *usually empty* — and that "usually" is the whole trick.

### `default.tsx` is the off switch

A parallel slot has to render *something* for every route, even routes that don't match it. If there's no match and no fallback, you get a 404 for the slot. `@modal/default.tsx` is that fallback, and for a modal it's the simplest file in the project:

```tsx
export default function ModalDefault() {
  return null;
}
```

Translation: "When the URL isn't a portfolio item, the modal slot renders nothing." So on the home page, the slot is empty and you just see the grid.

## Intercepting routes: catching navigation before it leaves

Now the magic folder: `@modal/(.)portfolio/[slug]`. That `(.)` prefix is an **intercepting route**. It tells Next.js:

> When the user navigates to `/portfolio/[slug]` *from within this segment* (a soft, client-side navigation — i.e. clicking a `<Link>`), don't load the real page. Render **this** into the matching slot instead.

The `(.)` matches the same level; there are also `(..)`, `(..)(..)`, and `(...)` variants for reaching up the tree. Mine sits at the same level as `portfolio/`, so `(.)portfolio` is the right match.

So a click on a card — which is just a `<Link href="/{locale}/portfolio/{slug}">` — gets *intercepted*. The grid never unmounts. The `@modal` slot, previously rendering `null` via `default.tsx`, now resolves to the intercepted page and pops the modal. The URL in the address bar updates to the real detail path. To the browser's history, it's a genuine navigation — which is what makes the next part work.

A **hard** navigation — typing the URL, reloading, or following a shared link — *isn't* intercepted. There's no segment to intercept from. So Next.js serves the real `portfolio/[slug]/page.tsx`: a full page with header, footer, metadata, and JSON-LD.

## The payoff: the modal content is real server-rendered HTML

Here's the part people miss. The intercepted modal page is still a **Server Component**. It fetches its own data on the server:

```tsx
// app/[locale]/@modal/(.)portfolio/[slug]/page.tsx
export default async function PortfolioModal({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const item = await getPortfolioBySlug(slug, locale as Locale);
  if (!item) notFound();

  return (
    <ModalShell>
      <PortfolioDetail item={item} />
    </ModalShell>
  );
}
```

And the standalone page renders the *exact same* `<PortfolioDetail>`, just wrapped in page chrome and accompanied by `generateMetadata` and structured data instead of a dialog:

```tsx
// app/[locale]/portfolio/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const item = await getPortfolioBySlug(slug, locale as Locale);
  if (!item) return {};
  return {
    title: item.title,
    description: item.shortDescription,
    alternates: buildAlternates(locale, `/portfolio/${slug}`), // canonical + hreflang
    openGraph: { /* ... */ },
    twitter: { card: "summary_large_image", /* ... */ },
  };
}

export default async function PortfolioPage({ params }) {
  // ...same getPortfolioBySlug, then:
  return (
    <main>
      <PortfolioDetail item={item} />
    </main>
  );
}
```

**`<PortfolioDetail>` is the single source of truth.** Gallery, description, tech stack, links — written once, rendered in both contexts. The modal and the page can never drift out of sync, because there's nothing to keep in sync. That reuse is the design goal; intercepting routes are just what make it possible without a `if (isModal)` branch polluting the component.

## Closing the modal = going back

The only client-side piece is the shell. Because opening the modal pushed a history entry, closing it is just `router.back()`:

```tsx
"use client";

export function ModalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <Dialog.Root open onOpenChange={(open) => !open && router.back()}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Close /* … */ />
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

`router.back()` pops the entry that the soft navigation created, the URL returns to the grid, the slot falls back to `default.tsx` → `null`, and the modal unmounts. Backdrop click, the close button, and `Esc` all funnel through `onOpenChange`, so every dismissal path stays consistent. Scroll position survives for free, because the grid behind it was never unmounted.

## The gotchas I hit

- **You need `default.tsx` for the slot, not just the page.** Forget it and unrelated routes throw a 404 for the slot. `return null` is the answer.
- **Intercepting only catches *soft* navigations.** This is the feature, not a bug — but it means you can't test the modal by typing the URL. You have to click in from the grid. Reloading an open modal is *supposed* to give you the full page.
- **Metadata lives on the real page, never the interception.** Crawlers and link unfurlers always perform hard requests, so they get `portfolio/[slug]/page.tsx` with its full `generateMetadata`. The modal doesn't need (and shouldn't have) its own metadata.
- **Keep the data fetch identical on both sides.** Both call the same `getPortfolioBySlug(slug, locale)`. Same cache behaviour, same `notFound()` handling — no surprises depending on entry point.

## Why it's worth it

The cost is two small files and a `default.tsx`. What you get back: a modal that is a first-class, linkable, refresh-proof, crawlable URL, with zero duplicated UI and zero modal state to manage. The browser's history stack does the bookkeeping you'd otherwise write by hand.

It's a small thing on a portfolio site. But it's exactly the kind of small thing that separates "I made a modal" from "I understood the routing model well enough to make the modal *correct*." That's the bar I want my own work held to.
