# Portfolio Website — Product Plan

## 1. Product Goal

**Turn LinkedIn profile visitors into meaningful professional conversations.**

This site exists to do one thing: make a recruiter, engineering manager, or fellow developer say *"I want to talk to this person."* It is not a blog, not a playground — it is a conversion tool disguised as a portfolio. Every page, every interaction should move a visitor closer to reaching out.

Success metrics:
- **Primary**: outbound contact rate (clicks on email/LinkedIn/GitHub)
- **Secondary**: time on site, portfolio detail views per session
- **Tertiary**: return visits

---

## 2. Target Audience

| Persona | Context | What they care about | Time budget |
|---|---|---|---|
| **Recruiter** | Scanning 20+ candidates from LinkedIn | Quick proof of competence, tech stack match, seniority signal | 30–90 seconds |
| **Engineering Manager** | Evaluating a specific candidate | Code quality, system thinking, communication ability | 2–5 minutes |
| **Tech Lead / Developer** | Curiosity or peer evaluation | Implementation details, architecture decisions, taste | 3–10 minutes |

Key insight: **Recruiters are the highest-volume visitor but have the lowest patience.** The site must pass their 30-second scan test while rewarding deeper exploration for technical visitors.

---

## 3. User Journey

```
LinkedIn Profile
    │
    ▼
┌─────────────────────────────────┐
│  Landing Page (Hero)            │  ← 5-second hook: name, title, one-liner
│  ↓ scroll                       │
│  Portfolio Grid                 │  ← Visual proof of work (3–6 cards)
│  ↓ scroll                       │
│  About / Skills Section         │  ← Credibility layer
│  ↓ scroll                       │
│  Contact / CTA                  │  ← Conversion point
└─────────────────────────────────┘
         │ click card
         ▼
┌─────────────────────────────────┐
│  Portfolio Detail Modal         │  ← Deep dive without losing context
│  - Image gallery                │
│  - Project description          │
│  - Tech stack tags              │
│  - Links (live site, GitHub)    │
└─────────────────────────────────┘
         │ close modal
         ▼
    Back to grid (scroll preserved)
         │
         ▼
    Contact action (email / LinkedIn / GitHub)
```

Critical UX decisions:
- **Single-page flow with scroll sections** — recruiters won't navigate multiple pages
- **Modal for detail** — preserves scroll position, feels fast, reduces bounce
- **URL-backed modal** (`/portfolio/[slug]`) — shareable, SEO-friendly, works with browser back button

---

## 4. Core Value Proposition

> "A portfolio that respects the viewer's time while demonstrating engineering craft."

The site itself is the portfolio. Clean code, fast load, smooth interactions, and thoughtful details signal the same qualities you bring to client projects. No gimmicks, no over-animation — just clear evidence of what you can build.

---

## 5. Recommended Sitemap

### Public routes

```
/                           → Landing page (hero + portfolio grid + about + contact)
/portfolio/[slug]           → Intercepted modal on homepage, standalone page via direct URL
```

### Admin routes (Clerk-protected)

```
/admin                      → Dashboard / portfolio list
/admin/portfolio/new        → Create portfolio item
/admin/portfolio/[id]/edit  → Edit portfolio item
/admin/images               → Image library (R2 browser)
```

### Auth routes (Clerk-managed)

```
/sign-in                    → Clerk sign-in
/sign-up                    → Clerk sign-up (optional, can be disabled)
```

### System routes

```
/api/images/upload          → R2 upload endpoint
/sitemap.xml                → Dynamic sitemap
/robots.txt                 → Static
```

---

## 6. Recommended Additional Pages (Post-MVP)

| Page | Purpose | Priority |
|---|---|---|
| `/about` | Dedicated about page with longer bio, timeline, philosophy | Medium |
| `/resume` | Downloadable PDF + inline resume view | Medium |
| `/blog` or `/writing` | Technical writing to demonstrate communication skills | Low |
| `/uses` | Tech stack / tools page (developer audience loves this) | Low |
| `/colophon` | How the site was built — meta-portfolio piece | Low |

**Recommendation**: Do NOT build these for MVP. The single-page flow is stronger for the primary audience. Add only if you have content that genuinely strengthens the narrative.

---

## 7. MVP Scope

### Must-have

| Feature | Details |
|---|---|
| **Hero section** | Name, title, one-liner tagline, primary CTA (email/LinkedIn) |
| **Portfolio grid** | 3–6 cards with thumbnail, title, short description, tech tags |
| **Portfolio detail modal** | Intercepting route modal with image gallery, full description, tech stack, external links |
| **Portfolio standalone page** | Same content as modal, for direct URL access and SEO |
| **About section** | Brief bio, key skills, years of experience — inline on homepage |
| **Contact section** | Email link, LinkedIn, GitHub — no contact form for MVP |
| **Admin: portfolio CRUD** | Create, read, update, delete portfolio items |
| **Admin: image upload** | Upload to R2, attach to portfolio items, reorder gallery |
| **Admin: auth** | Clerk sign-in, protect all `/admin` routes and server actions |
| **SEO basics** | Meta tags, OG images, sitemap.xml, semantic HTML |
| **Responsive design** | Mobile-first, works perfectly on phone (recruiters browse on mobile) |
| **Performance** | < 1s LCP, 100 Lighthouse performance score target |

### Explicitly out of MVP

- Contact form (email link is enough; forms add spam risk and maintenance)
- Blog / writing section
- Analytics dashboard in admin
- i18n translations (architecture is ready, content stays English)
- Dark mode toggle (pick one theme and ship)
- Animations beyond subtle transitions
- Comments or social features

---

## 8. Post-MVP Scope

**Phase 2 — Content depth**
- About page with career timeline
- Resume page with PDF download
- Blog/writing section (MDX or DB-stored)
- Project case studies (longer-form portfolio entries)

**Phase 3 — Polish and reach**
- Dark mode
- i18n (Korean, etc.)
- Analytics integration (Vercel Analytics or Plausible)
- Contact form with rate limiting
- OG image generation per portfolio item
- RSS feed for blog

**Phase 4 — Advanced**
- Admin analytics dashboard
- A/B testing on hero copy
- Visitor heatmaps
- Email newsletter signup

---

## 9. Content Strategy

### Portfolio items — what to show

Each portfolio item needs:

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | Project name |
| `slug` | Yes | URL-safe, auto-generated from title |
| `shortDescription` | Yes | 1–2 sentences for the card (max 120 chars) |
| `fullDescription` | Yes | 2–4 paragraphs for the detail view (Markdown) |
| `thumbnailUrl` | Yes | 16:9 or 4:3, used on card |
| `images` | Yes | Gallery images for detail view (ordered) |
| `techStack` | Yes | Array of technology names |
| `liveUrl` | No | Link to deployed project |
| `githubUrl` | No | Link to source code |
| `featured` | Yes | Boolean — featured items appear first |
| `sortOrder` | Yes | Manual ordering |
| `status` | Yes | `draft` / `published` |
| `startDate` | No | When work began |
| `endDate` | No | When work completed |
| `createdAt` | Auto | Timestamp |
| `updatedAt` | Auto | Timestamp |

### Content principles

1. **Show, don't tell** — screenshots and live links over paragraphs of description
2. **Lead with impact** — what the project does, not how you built it
3. **Tech stack as metadata** — visible but not the headline
4. **Curate ruthlessly** — 4 excellent projects > 12 mediocre ones
5. **Write for scanners** — bullet points, bold key phrases, short paragraphs

### Hero copy framework

```
[Your Name]
Frontend Developer

I build [type of thing] that [key quality].
[Primary CTA button]
```

Keep it to one sentence. No "passionate about" or "detail-oriented." Show it through the work.

---

## 10. UX Principles

1. **Speed is a feature** — every interaction should feel instant. Preload modal content, optimize images, minimize JS.

2. **Progressive disclosure** — homepage is the overview, modal is the deep dive. Don't front-load information.

3. **Respect the back button** — modal URLs, scroll restoration, no broken navigation states.

4. **Mobile is not secondary** — recruiters browse on phones between meetings. The mobile experience must be excellent, not just "responsive."

5. **Whitespace is premium** — Airbnb-like means generous spacing, limited content per viewport, and letting the work breathe.

6. **No dead ends** — every view should have a clear next action. After viewing a project → next project or contact. After scrolling to bottom → CTA.

7. **Typography carries the design** — with minimal UI, font choice, size hierarchy, and line height do the heavy lifting. Use one font family (Inter or similar), 3–4 size steps max.

8. **Subtle motion only** — page transitions, hover states, and modal open/close should be smooth but never showy. No scroll-jacking, no parallax, no loading animations.

---

## 11. Admin CMS Requirements

### Portfolio management

| Capability | Details |
|---|---|
| **List view** | Table of all portfolio items with title, status, sort order, thumbnail preview |
| **Create/Edit form** | react-hook-form + zod validation, all fields from content strategy |
| **Markdown editor** | For `fullDescription` — use a simple textarea with preview, not a rich editor (keep deps light) |
| **Image upload** | Drag-and-drop to R2, with progress indicator |
| **Image gallery management** | Reorder images, set thumbnail, delete images |
| **Publish workflow** | Draft → Published toggle, with confirmation |
| **Sort order** | Drag-to-reorder or numeric input |
| **Delete** | Soft confirmation dialog, cascade-delete images from R2 |

### Image management

| Capability | Details |
|---|---|
| **Image library** | Grid view of all uploaded images |
| **Upload** | Multi-file upload with progress |
| **Metadata** | File name, size, dimensions, upload date, which portfolio items use it |
| **Delete** | With orphan check — warn if image is used by a portfolio item |
| **Image optimization** | Serve via R2 with appropriate cache headers; consider generating thumbnails on upload |

### Auth and security

- Clerk middleware protects all `/admin/*` routes
- Server Actions verify Clerk session before any mutation
- No public API for writes — all mutations are Server Actions
- Rate limiting on image uploads

---

## 12. Risks and Trade-offs

| Risk | Impact | Mitigation |
|---|---|---|
| **Over-engineering the admin** | Delays launch, no one sees the admin except you | Ship the minimum viable admin. A working portfolio page matters more than a polished CMS. |
| **Too few portfolio items at launch** | Site looks empty, undermines credibility | Have 4–6 projects ready before going live. Quality screenshots are essential. |
| **Cloudflare R2 complexity** | Signed URLs, CORS, cache invalidation add friction | Start with public bucket + simple upload. Add signed URLs only if needed. |
| **Modal UX on mobile** | Modals on mobile can feel cramped or broken | On mobile, consider navigating to full page instead of modal. Test thoroughly on real devices. |
| **Clerk free tier limits** | May hit limits as site grows | For a personal portfolio, free tier is more than sufficient. Monitor usage. |
| **Single-page vs multi-page SEO** | Single page limits keyword targeting | Portfolio detail pages have their own URLs (intercepting routes), so individual projects are indexable. The homepage targets your name + "frontend developer." |
| **Dark mode deferred** | Some users prefer dark mode | Ship with one well-designed theme. Dark mode is a post-MVP polish item, not a launch blocker. |
| **No contact form** | Some visitors prefer forms over email links | An email `mailto:` link opens their default client. LinkedIn DM is the backup. Forms add spam and maintenance burden for minimal conversion lift. |

---

## 13. Implementation Priority

Execute in this order. Each phase should be deployable.

### Phase 1 — Foundation (do first)
1. Database schema (Drizzle + Neon) — portfolio items and images tables
2. Clerk auth setup — middleware, sign-in page, admin route protection
3. Admin portfolio CRUD — form, validation, list view
4. R2 image upload — basic upload endpoint and admin image management

### Phase 2 — Public site
5. Homepage layout — hero, portfolio grid, about, contact sections
6. Portfolio cards — responsive grid, thumbnails, tech tags
7. Portfolio detail modal — intercepting route, image gallery, full content
8. Portfolio standalone page — for direct URL and SEO

### Phase 3 — Polish
9. SEO — meta tags, OG images, sitemap.xml, structured data
10. Performance optimization — image optimization, preloading, Lighthouse audit
11. Responsive QA — thorough mobile testing and fixes
12. Content — write and upload actual portfolio items

### Phase 4 — Launch
13. Deploy to Vercel
14. Custom domain
15. LinkedIn profile update with link
16. Monitor and iterate
