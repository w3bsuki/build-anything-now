# Tech Stack — Vite SPA vs Next.js

> **Context:** Pawtreon is an app-like product (mobile-first UX) with Convex as the backend and Capacitor for iOS/Android.

---

## Recommendation (for speed + native)
**Keep the app on Vite + React Router** for the core product and Capacitor wrapper.

Add **a small SSR layer** only where it matters (marketing + share pages):
- Option A: a separate **Next.js** project for `/(share|s)/case/:id` pages (OpenGraph), plus a marketing homepage.
- Option B: **Astro/SSG** marketing site + dynamic OG image generation via serverless.

This avoids rewriting the whole app while still getting SEO + social sharing.

---

## Is Next.js “better” than Vite?
Not universally.

- **Vite** is an excellent choice for an app-like, authenticated product (fast dev loop, simple deployment, great with Capacitor).
- **Next.js** shines when you need **SSR/SSG**, **SEO**, **OpenGraph** previews, and server-side rendering of share/marketing pages.

If your “growth surface” is mostly **shares** + **landing pages**, you can get the main benefits of Next.js **without** migrating the whole app.

---

## Why not migrate the whole app to Next.js right now
- **Capacitor + SPA is the shortest path** to “web → native” with one UI codebase.
- **Convex already provides your backend**; you don’t need Next.js to “get APIs”.
- A full migration will slow feature delivery (routing, auth wiring, data fetching, build, deployment).

---

## Where Next.js is genuinely better (and how to get it without a rewrite)
### 1) Social sharing previews (OpenGraph)
When users share a case link, social platforms want server-rendered meta tags.
- SPA routes typically can’t generate per-case OG tags.
- Solution: **SSR share pages** that fetch case data and render OG meta, then deep-link to the app.

### 2) Marketing SEO
If you want organic discovery, blog posts, landing pages, and partner pages:
- Put those on a **server-rendered / static** marketing site.

---

## “We can just copy/paste to Next.js later”, reality check
You can reuse a lot of **UI components**, but the migration is not a pure copy/paste:

- **Routing changes:** `react-router-dom` → file-based routes; replace `Link`, `useNavigate`, `useParams`, `useSearchParams`, etc.
- **Client/server split:** with Next App Router, many pages/components need `"use client"` and you must avoid server-only APIs in client components.
- **Env var prefixes:** `VITE_*` → `NEXT_PUBLIC_*` for browser-exposed vars.
- **Deployment/runtime:** SSR introduces caching, edge/runtime decisions, and different failure modes.

So: migration is **doable**, but it’s a real project (typically days/weeks depending on app size), not a “one afternoon” task.

---

## Native app path
### Phase 1 (now)
- **Capacitor** for iOS/Android distribution
- Add native affordances (haptics, camera, share sheet, push notifications)

### Phase 2 (later, if needed)
- Evaluate **React Native** only if you hit real WebView limits (heavy camera, background tasks, complex maps).
- Keep Convex + Clerk; reuse data layer and schemas.

---

## What this means for the investor pitch (Jan 24, 2026)
- Show the app UX (fast, app-like).
- Explain the **SSR share pages** plan as the “growth/virality” layer (not a rewrite).
