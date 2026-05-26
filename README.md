# Portfolio Website

A production-ready, multi-language portfolio + blog template built with the
modern Next.js App Router stack. Designed to be **forked, configured in
30 minutes, and made yours**.

> Live example: [hwanhoon.kim](https://hwanhoon.kim)

---

## Features

- **Multi-page portfolio** with a centered modal detail view (parallel
  routes + intercepting routes)
- **Markdown/Tiptap blog** with cover images, tags, pagination, and a
  rich-text admin editor (autosave to localStorage)
- **Admin CMS** at `/admin` for portfolio items, blog posts, and image
  library — protected by Clerk + an explicit allowlist
- **i18n-ready** with `next-intl`. Adding a new language is **two files**
  (locale code + UI translations). Per-locale content stored in the DB
  with English fallback
- **SEO out of the box**: per-page metadata, `hreflang` alternates,
  sitemap, robots, JSON-LD, OG images
- **Cloudflare R2** image upload pipeline with `next/image` optimization
- **Dark / light / system** theme via `next-themes`
- **Accessible by default**: skip link, semantic landmarks, focus styles,
  ARIA on interactive elements
- **Type-safe end to end**: TypeScript, Drizzle ORM, Zod validation,
  Server Actions

---

## Tech stack

| Concern             | Choice                                                  |
| ------------------- | ------------------------------------------------------- |
| Framework           | Next.js 16 (App Router, Turbopack, RSC)                 |
| Language            | TypeScript 5, React 19                                  |
| Styling             | Tailwind CSS v4 + shadcn/ui + Base UI                   |
| Database            | Postgres on Neon, accessed via Drizzle ORM              |
| Auth                | Clerk (admin-only, allowlist)                           |
| File storage        | Cloudflare R2 (S3-compatible)                           |
| Forms / validation  | react-hook-form + Zod                                   |
| Rich text editor    | Tiptap (admin) → server-rendered HTML (public)          |
| i18n                | next-intl                                               |
| Linting / format    | Biome                                                   |
| Analytics           | Vercel Analytics                                        |
| Deployment          | Vercel (recommended)                                    |

---

## Quick start (TL;DR)

```bash
git clone <your-fork> && cd portfolio-website
bun install                                # or pnpm/npm install
cp .env.example .env.local                 # then fill in the values
bun run db:migrate                         # apply DB schema to Neon
bun run dev                                # http://localhost:3000
```

See the next section for the full walkthrough.

---

## Full setup

### 1. Prerequisites

- **Node.js 20+** (Node 24 recommended on Vercel)
- A package manager — examples below use **Bun**, but `pnpm`, `npm`, and
  `yarn` work too. Just swap `bun run` for `pnpm`, `npm run`, etc.
- Free-tier accounts for the three external services:
  - [Neon](https://neon.tech) — Postgres database
  - [Clerk](https://clerk.com) — Authentication
  - [Cloudflare R2](https://developers.cloudflare.com/r2/) — Image storage

### 2. Fork & clone

```bash
# After clicking "Fork" on GitHub:
git clone https://github.com/<your-username>/portfolio-website.git
cd portfolio-website
bun install
```

### 3. Provision external services

#### Neon (database)

1. Create a project in the Neon console.
2. Copy the **connection string** (it looks like
   `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`).
3. Paste it into `.env.local` as `DATABASE_URL`.

#### Clerk (admin auth)

1. Create an application in the Clerk dashboard.
2. From **API Keys**, copy the publishable key and secret key into
   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
3. Under **Paths**, set "Sign-in URL" to `/sign-in`. (Sign-up is
   intentionally disabled — the admin allowlist below is the gate.)
4. **You'll add your own Clerk user ID to `ADMIN_USER_IDS` after first
   sign-in.** See step 6.

#### Cloudflare R2 (image storage)

1. In the Cloudflare dashboard, create an R2 bucket (e.g.
   `your-portfolio-images`).
2. Under **R2 → Manage R2 API Tokens**, create a token with **Object Read
   & Write** permissions for that bucket. Copy the Access Key ID and
   Secret Access Key.
3. Enable **public access** on the bucket (Settings → R2.dev subdomain).
   Copy the public URL (e.g. `https://pub-xxxxxx.r2.dev`).
4. Find your **Account ID** on the R2 overview page.
5. Fill the corresponding `R2_*` variables in `.env.local`.

### 4. Configure `.env.local`

Copy `.env.example` and fill in real values:

```bash
cp .env.example .env.local
```

```env
# Database
DATABASE_URL=postgresql://...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-in   # sign-up disabled, points back to sign-in

# Admin allowlist — empty = nobody is admin (deny by default)
ADMIN_USER_IDS=

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=your-portfolio-images
R2_PUBLIC_URL=https://pub-xxxxxx.r2.dev

# Optional: canonical site URL used for SEO / sitemap / OG. Defaults to
# https://hwanhoon.kim — definitely change this before deploying!
NEXT_PUBLIC_SITE_URL=https://yourname.com
```

### 5. Apply the database schema

```bash
bun run db:migrate
```

This runs the pre-generated migrations in `lib/db/migrations/` against
your Neon database. You should now see the `portfolio_items`, `posts`,
`tags`, `images`, and `*_translations` tables.

> If you already had this database in another environment managed with
> `drizzle-kit push`, run `bun run db:bootstrap` once first — see
> [`lib/db/migrations/README.md`](./lib/db/migrations/README.md).

### 6. Grant yourself admin access

1. Start the dev server: `bun run dev`
2. Visit [http://localhost:3000/sign-in](http://localhost:3000/sign-in)
   and sign up with your own account (the Clerk dashboard lets you
   create accounts even when sign-up is disabled in the app).
3. In the Clerk dashboard → **Users**, copy your `user_...` ID.
4. Paste it into `ADMIN_USER_IDS` in `.env.local`:
   ```env
   ADMIN_USER_IDS=user_2abc123xyz...
   ```
5. **Restart the dev server** so the env var is picked up.
6. Visit [http://localhost:3000/admin](http://localhost:3000/admin) — you
   should see the admin dashboard.

That's it — you can now create portfolio items, upload images, and write
blog posts.

---

## Personalize your portfolio

Most personal content lives in **three places**. Update these and the
site is yours:

### 1. Site identity — `lib/site-config.ts`

```ts
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://yourname.com";

export const SITE_AUTHOR = "Your Name";
```

### 2. UI copy — `messages/en.json`

Every piece of UI text (nav, hero, about, contact, blog labels, etc.)
is in `messages/{locale}.json`. Edit `en.json` to put your own name,
tagline, bio, work history, contact links, etc.

Add other locales by creating sibling files (`fr.json`, `ko.json`, …)
and registering them — see [Adding a new language](#adding-a-new-language).

### 3. Root metadata — `app/layout.tsx`

The default `<title>`, OpenGraph description, and authors metadata live
here. Replace the hardcoded "Kim Hwanhoon" / tagline strings.

> The home page (`app/[locale]/page.tsx`) also has a JSON-LD `Person`
> schema — update `name`, `jobTitle`, and `description` there for rich
> search results.

### 4. Theme & branding (optional)

- **Colors / radius**: `app/globals.css` — Tailwind v4 theme tokens (CSS
  variables). Override `--primary`, `--background`, etc.
- **Fonts**: `app/layout.tsx` — currently Geist, Inter, and Montserrat
  via `next/font/google`.
- **Favicon / app icon**: `app/icon.tsx` (generated at build time —
  replace the SVG/canvas drawing with your own).
- **OG images**: `app/[locale]/opengraph-image.tsx` and the per-section
  variants under `app/[locale]/portfolio/` and `app/[locale]/blog/`.

---

## Managing content

All content lives in the database and is edited through `/admin`.

### Portfolio items — `/admin`

- **Title, descriptions, tech stack, links, dates, sort order**
- **Thumbnail** + **image gallery** (modal shows a carousel)
- **Status**: draft / published. Drafts are hidden from the public site
- **Featured** flag for the home page highlight
- **Multi-language**: each item has tabs for every configured locale.
  Non-default locales are optional and fall back to the default

### Blog posts — `/admin/posts`

- **Tiptap** rich-text editor with images, code blocks, links,
  typography extensions
- **Cover image, excerpt, tags, publish date, featured flag**
- **Reading time** auto-computed from the default-locale content
- **Autosave to localStorage** every 10s (with a restore prompt if you
  closed the tab mid-edit)
- **Multi-language**: separate editor instance per locale, with
  per-locale autosave

### Images — `/admin/images`

Central image library, uploaded to R2 with an auto-generated public URL.
Images attached to a portfolio item are linked; standalone images are
available for blog cover photos and inline embeds.

---

## Adding a new language

Thanks to the i18n refactor, this requires **two file changes**:

1. Register the locale in `i18n/routing.ts`:

```ts
export const routing = defineRouting({
  locales: ["en", "fr", "ko", "ja"],   // ← add "ja"
  defaultLocale: "en",
});

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  ko: "한국어",
  ja: "日本語",                          // ← add display name
};
```

2. Create `messages/ja.json` (copy `en.json` and translate).

Everything else updates automatically:
- Admin forms gain a new locale tab marked "Optional"
- The header locale switcher gets a new dropdown option
- New routes (`/ja`, `/ja/blog`, `/ja/portfolio/[slug]`) start serving
- Zod schemas, queries, autosave, sitemap, and `hreflang` all adapt
- Missing translations gracefully fall back to the default locale

> The default locale is required at the DB level and used for slugs and
> reading-time calculation. Don't change it post-launch without a
> migration plan.

---

## Project structure

```
.
├── app/
│   ├── [locale]/              # Public, localized pages
│   │   ├── page.tsx           # Home (hero + portfolio + about + contact)
│   │   ├── about/             # Standalone about page
│   │   ├── blog/              # Blog index, post detail, tag filter
│   │   ├── portfolio/[slug]/  # Portfolio detail (standalone route)
│   │   └── @modal/            # Parallel route for the home-page modal
│   ├── admin/                 # CMS (Clerk-protected)
│   │   ├── _components/       # PortfolioForm, PostForm, ImagePicker, …
│   │   ├── portfolio/[id]/
│   │   ├── posts/
│   │   └── images/
│   ├── actions/               # Server Actions (createPortfolio, …)
│   ├── api/images/upload/     # R2 upload route handler
│   ├── sign-in/               # Clerk sign-in page
│   ├── layout.tsx             # Root layout (theme, font, providers)
│   ├── icon.tsx               # Dynamic favicon
│   ├── opengraph-image.tsx    # OG image for the root URL
│   ├── robots.ts              # /robots.txt
│   └── sitemap.ts             # /sitemap.xml (locale-aware)
├── components/
│   ├── layout/                # Header, footer, locale switcher, theme toggle
│   ├── sections/              # Home page sections
│   ├── portfolio/             # Cards, modal, gallery, detail
│   ├── blog/                  # Post grid, hero, content, tag filter
│   └── ui/                    # shadcn/ui primitives
├── i18n/
│   ├── routing.ts             # ⭐ Locales source of truth
│   └── request.ts             # next-intl message loader
├── messages/                  # UI translations per locale
├── lib/
│   ├── db/
│   │   ├── schema.ts          # Drizzle schema
│   │   ├── migrations/        # Generated SQL (committed)
│   │   ├── translations.ts    # Upsert / fallback helpers
│   │   └── index.ts           # Neon client
│   ├── queries/               # Read queries with locale fallback
│   ├── validators/            # Zod schemas
│   ├── auth/admin.ts          # Allowlist check
│   ├── r2/client.ts           # S3 client for Cloudflare R2
│   ├── i18n/
│   │   ├── metadata.ts        # hreflang / canonical builder
│   │   ├── zod-helpers.ts     # Dynamic translation schemas
│   │   └── translation-utils.ts
│   ├── site-config.ts         # ⭐ Site URL & author
│   └── blog/content.ts        # Tiptap → HTML → reading time
├── scripts/
│   └── bootstrap-migrations.ts # One-off ledger seed
├── proxy.ts                   # Middleware (auth + i18n)
├── drizzle.config.ts
├── next.config.ts
└── .env.example
```

---

## Database workflow

The schema lives in `lib/db/schema.ts`. Whenever you change it:

```bash
# 1. Generate a new migration file from the diff
bun run db:generate

# 2. Review the generated SQL under lib/db/migrations/
#    (especially renames, drops, or anything destructive)

# 3. Commit schema.ts + the new migration together

# 4. Apply on each environment
bun run db:migrate
```

> **Never** use `drizzle-kit push` on a shared database — it skips the
> migration file and breaks the version history. See
> [`lib/db/migrations/README.md`](./lib/db/migrations/README.md) for the
> full rationale.

Browse data interactively:

```bash
bun run db:studio
```

---

## Deployment

### Vercel (recommended)

1. Push your fork to GitHub.
2. Import the repo into Vercel.
3. Copy every variable from `.env.local` into the Vercel project's
   **Environment Variables** (Production scope at minimum).
4. Make sure `NEXT_PUBLIC_SITE_URL` matches your production domain.
5. Deploy. Migrations are **not** run automatically — apply them locally
   with `DATABASE_URL` pointing at your production Neon branch:

   ```bash
   DATABASE_URL=<prod-url> bun run db:migrate
   ```

   For a fully automated flow, add a build hook or a CI step that runs
   `bun run db:migrate` against the production database.

### Custom domain checklist

- Update `NEXT_PUBLIC_SITE_URL` in Vercel → redeploy
- Update Clerk's **Allowed origins** to include your domain
- Update Cloudflare R2's CORS rules if you serve images on a custom
  subdomain (the default `pub-xxx.r2.dev` works without any CORS setup)
- Optional: set `metadataBase` in `app/layout.tsx` (already wired to
  `SITE_URL`)

---

## Scripts reference

| Script              | What it does                                          |
| ------------------- | ----------------------------------------------------- |
| `bun run dev`       | Next dev server on `localhost:3000`                   |
| `bun run build`     | Production build (also typechecks)                    |
| `bun run start`     | Run the production build                              |
| `bun run lint`      | Biome check (lint + format check)                     |
| `bun run lint:fix`  | Biome check with auto-fix                             |
| `bun run format`    | Biome format only                                     |
| `bun run db:generate` | Generate a new migration from `schema.ts`           |
| `bun run db:migrate`  | Apply pending migrations to `DATABASE_URL`          |
| `bun run db:studio`   | Open Drizzle Studio in the browser                  |
| `bun run db:bootstrap`| One-off ledger seed for existing `push`-style DBs   |

---

## Architectural notes

A few decisions worth knowing about before you hack on the codebase:

- **Server Components by default.** Client Components are limited to
  interactive widgets (admin forms, theme toggle, modal trigger, locale
  switcher). All data fetching happens on the server.
- **Server Actions for mutations.** Admin CRUD goes through
  `app/actions/*.ts`. Every action calls `requireAdmin()` first and
  validates input with a Zod schema.
- **Translations are a separate table** (`*_translations`) joined by
  `(parent_id, locale)`. Public queries use `LEFT JOIN` on the requested
  locale + `INNER JOIN` on the default, with `COALESCE` for per-field
  fallback. The default locale's row is always required.
- **The modal on the home page is a parallel + intercepting route**
  (`app/[locale]/@modal/(.)portfolio/[slug]`). Clicking a card opens the
  detail in a dialog without losing the home scroll position; direct
  links to `/portfolio/[slug]` render the full standalone page.
- **Image uploads** go through `app/api/images/upload/route.ts`, which
  authenticates with Clerk, uploads to R2 with the AWS SDK, and inserts
  a row in `images`. `next/image` reads from R2 via `remotePatterns`
  configured in `next.config.ts`.
- **Tiptap content** is stored as both JSON (source of truth, for the
  editor) and HTML (pre-rendered, sanitized with DOMPurify, served to
  visitors). Reading time is computed from the default-locale HTML.
- **Default-deny admin allowlist.** An empty `ADMIN_USER_IDS` means
  *nobody* is admin — even authenticated users get a 403 on `/admin`.

---

## Troubleshooting

<details>
<summary><b><code>Error: No database connection string was provided to neon()</code></b></summary>

Your `.env.local` is missing `DATABASE_URL`, or you imported a
server-only module (e.g. `lib/db/index.ts`) into a Client Component.
Use the client-safe helpers in `lib/i18n/translation-utils.ts`.

</details>

<details>
<summary><b>Visiting <code>/admin</code> shows "Forbidden"</b></summary>

Your Clerk user ID isn't in `ADMIN_USER_IDS`. Copy it from the Clerk
dashboard (Users → click your user → copy ID), paste into `.env.local`,
restart the dev server.

</details>

<details>
<summary><b>Image uploads fail with a 500 / CORS error</b></summary>

- Confirm all four `R2_*` env vars are set and correct.
- The R2 token must have **Object Read & Write** on the bucket.
- The bucket needs **public access** enabled, and `R2_PUBLIC_URL` must
  match the `pub-xxx.r2.dev` URL Cloudflare shows you.
- Restart the dev server after changing env vars.

</details>

<details>
<summary><b>French/Korean text shows English instead</b></summary>

The DB doesn't have a translation for that locale yet — public queries
fall back to the default locale on purpose. Open the item in `/admin`,
switch to the locale tab, fill it in, save.

</details>

<details>
<summary><b><code>db:migrate</code> says "no migrations to run" but the schema is wrong</b></summary>

The database was previously managed with `drizzle-kit push` and has no
migration ledger. Run `bun run db:bootstrap` once, then `bun run
db:migrate`.

</details>

---

## License

MIT — fork it, customize it, ship it. Attribution is appreciated but
not required.

If you build something cool with this, I'd love to see it. Open an issue
or PR with a link!

---

## Credits

Built by [Kim Hwanhoon](https://hwanhoon.kim). Powered by Next.js,
Vercel, Neon, Clerk, Cloudflare R2, shadcn/ui, and a lot of coffee.
