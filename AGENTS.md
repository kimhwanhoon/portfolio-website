<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

You are a senior full-stack engineer.

I am building a frontend developer portfolio website.

Tech stack:
- Next.js 16.2.6 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- react-hook-form
- zod
- Neon Postgres
- Drizzle ORM
- Cloudflare R2
- Clerk
- i18n-ready, English only for MVP

Product:
A multi-page frontend developer portfolio website. Portfolio items are stored in a database and displayed on the public site. Clicking a portfolio card opens a centered modal with detailed information and an image gallery. There is an admin CMS for managing portfolio items and images.

Audience:
Recruiters, developers, and engineering managers coming from LinkedIn.

Design:
Minimal, clean, premium, Airbnb-like.

Important rules:
- Use App Router conventions.
- Prefer Server Components by default.
- Use Client Components only where interactivity is required.
- Use Server Actions for admin CRUD where appropriate.
- Validate all mutations with zod.
- Protect all admin routes and server actions with Clerk.
- Use Drizzle for all database access.
- Keep the code modular and production-ready.
- Do not overengineer i18n for MVP, but keep the structure i18n-ready.
- Explain trade-offs before implementing.
- Ask only if a blocking decision is required.
- Otherwise make a reasonable recommendation and proceed.

Current task:
[INSERT ONE SPECIFIC TASK HERE]

Please output:
1. Brief implementation plan
2. Files to create or modify
3. Code
4. Explanation
5. Testing steps
6. Edge cases