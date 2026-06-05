# MuayThaiGuide

A map-first travel guide to Muay Thai gyms in Thailand. Pick a city, see every
gym plotted on a map beside a ranked list, and open any gym for a full profile.

> **Status: M1–M6 complete (MVP).** Map-first guide is feature-complete on seed
> data: Thailand overview map, interactive city view (map + ranked list, two-way
> hover sync, mobile toggle), gym profiles (intercepted panel + canonical SEO
> page), env-gated Google Places integration (off by default), global search,
> URL-synced filters, sitemap/robots/Open Graph, and loading/empty states.
> Before launch: verify the placeholder editorial content and swap in real
> `place_id`s (see below).

## Tech stack

- **Next.js 16 (App Router) + TypeScript** (strict) — server-rendered city/gym
  pages for SEO.
- **Tailwind CSS** — styling.
- **MapLibre GL** (planned, M2) — open-source map that renders with free tiles
  and **no API key**, so the whole map UI is built and tested at zero cost.
- **Typed seed data** in `src/data/` — no database yet.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

No API keys are required to run the site — it ships with seed data.

## Project layout

```
src/
  app/                 # routes (M1: single sanity page)
  data/
    cities.ts          # the 3 seed cities (real coords/bounds)
    gyms.ts            # seed gyms — editorial + placeholder Google blocks
  lib/
    types.ts           # domain types (editorial vs Google separation)
    ranking.ts         # weighted-score formula + tunable constants
    data.ts            # the ONLY data access layer (M5 swaps Google here)
```

## How the data is sourced (important)

Two sources are kept **physically separate**, joined by Google's `place_id`:

| Source        | Fields                                                                          | Lifetime                       |
| ------------- | ------------------------------------------------------------------------------- | ------------------------------ |
| **Editorial** | description, known_for, style, trainers, price, accommodation, experience level | Ours. Committed. Kept forever. |
| **Google**    | lat/lng, rating, review count, photos, hours, website, phone                    | Fetched by `place_id`. Short-TTL. |

Per Google's Terms, only `place_id` may be stored long-term; ratings/photos/
reviews are hydrated at runtime and cached only briefly. The architecture
reflects this: editorial lives in `src/data/gyms.ts` (`GYMS_EDITORIAL`), Google
fields are a separate block (`GYMS_GOOGLE_SEED` today, the live API in M5), and
`src/lib/data.ts` is the single merge point.

### Seed data caveat

Gym **names and cities are real**, but all **editorial content is plausible
placeholder** written to exercise the UI — every record is tagged
`// TODO(editorial): verify`. The Google blocks are placeholders too
(`place_id` values start with `SEED_PLACEHOLDER_`, `last_synced: "seed"`).
**Verify before launch.**

## Editorial workflow — adding or editing a gym

1. Open `src/data/gyms.ts`.
2. Add an entry to `GYMS_EDITORIAL` (TypeScript enforces the shape — see
   `GymEditorial` in `src/lib/types.ts`). Use a unique `id`/`slug`; set
   `citySlug` to a city in `src/data/cities.ts`. Allowed `known_for` tags are
   the `KNOWN_FOR_TAGS` list in `types.ts`.
3. Add a matching entry (same `id`) to `GYMS_GOOGLE_SEED` for offline/dev
   coordinates and rating. Once M5 is live, the real `place_id` makes this an
   optional fallback.
4. `gym_count` per city is derived automatically.

## Ranking

Gyms are ordered by a Bayesian weighted score (IMDb-style) so a 4.9 over 600
reviews beats a 5.0 over 3:

```
score = (v / (v + m)) * R + (m / (v + m)) * C
```

Tune `m` (confidence threshold) and `C` (global mean prior) in
`src/lib/ranking.ts → RANKING_CONFIG`.

## Enabling the Google Places API (Milestone 5 — incurs cost)

> ⚠️ **Off by default.** Google Maps Platform bills **per request**, and the old
> $200/month credit ended Feb 2025. Every request bills once enabled. Do not
> enable without intending to pay.

The integration is built ([lib/places.ts](src/lib/places.ts)) but inert until
you opt in:

1. Create a Google Cloud project, enable **Places API (New)**, create an API key.
2. **Restrict the key**: by HTTP referrer (your domains) and by API (Places API
   New only). The key is used **server-side only** (incl. a photo proxy at
   `/api/places/photo`), never exposed to the browser.
3. `cp .env.local.example .env.local`, set `GOOGLE_PLACES_API_KEY` and
   `ENABLE_GOOGLE_PLACES=true`.
4. Replace the seed `place_id`s (they start with `SEED_PLACEHOLDER_`) in
   `src/data/gyms.ts` with **real** Place IDs — otherwise every live lookup
   404s and silently falls back to the seed block.

### How it respects cost & Google's Terms

- **Tight field mask** — `lib/places.ts` requests only the fields we render.
  Billing scales to the *highest SKU tier* among requested fields, so a minimal
  mask keeps cost down.
- **Short-term caching only** — the Places client caches responses in memory for
  6h; pages use ISR with a matching 6h `revalidate`. We persist **only**
  `place_id` + editorial content; ratings/reviews/photos are never written to
  disk. (For multi-instance deploys, swap the in-memory cache for a shared
  short-TTL store or a scheduled refresh job.)
- **Graceful fallback** — not-found, rate-limited (429), or failed requests fall
  back to the seed Google block, so the site never breaks. Verified: with the
  flag on and an invalid key, every gym logs `falling back to seed` and pages
  still render.

With the flag off or the key absent, **zero** Google calls are made and the app
runs on seed data — local dev stays free.

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm run lint    # eslint
```
