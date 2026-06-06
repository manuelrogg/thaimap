@AGENTS.md

# MuayThaiGuide

Map-first Muay Thai gym guide for Thailand. Deployed on Netlify at `muaythaiguide.com`.

## Stack

- **Next.js 16.2.7** (App Router) + **React 19** + **TypeScript**
- **MapLibre GL** for interactive maps
- **Tailwind CSS 4** (PostCSS plugin, not Vite)
- **Netlify** with `@netlify/plugin-nextjs` (auto-installed)
- Node 22 required (set in `netlify.toml`)

## Deployment

The app is deployed on Netlify and accessible via the **Netlify CLI** (`netlify`). Use `netlify dev` to run a local environment that mirrors the Netlify production config (env vars, functions, redirects). Use `netlify deploy` for preview deploys and `netlify deploy --prod` for production.

## Commands

```bash
npm run dev          # start dev server
npm run build        # production build
npm run lint         # eslint
netlify dev          # local env with Netlify config (env vars, redirects)
netlify deploy       # preview deploy
netlify deploy --prod  # production deploy

# geodata scripts (run when updating map data)
npm run fetch:islands   # fetch island polygons from OSM
npm run build:regions   # build thailand-regions.geo.json
npm run build:mask      # build thailand-mask.geo.json
```

## Architecture

### Two data sources — kept strictly separate

| Layer | Source | Persistence |
|---|---|---|
| **Editorial** | `src/data/gyms.ts`, `src/data/cities.ts` | Committed forever — we own it |
| **Google** | Google Places API (by `place_id`) | Short-TTL runtime cache only |

**Google ToS rule:** only `place_id` may be persisted long-term. Ratings, photos, reviews are volatile and fetched at runtime. Never commit Google API responses as static data.

### Data flow

`src/data/gyms.ts` → `src/lib/data.ts` (merge layer) → page/component

`lib/data.ts` is the **only** place that joins editorial + Google. UI components never import raw seed files.

When the Places flag is off (no `GOOGLE_PLACES_API_KEY` env var), the app falls back to seed data — fully functional with zero API cost.

### Gym images

Drop `public/gyms/{gym-id}.jpg` (or `.png`, `.webp`, `.avif`) and it's auto-detected — no code changes needed. The image map is built once at startup; restart dev to pick up new files.

## Key types (`src/lib/types.ts`)

- `GymEditorial` — permanent curated data (slug, description, tags, trainers, price…)
- `GymGoogle` — volatile Google data (lat/lng, rating, photos, hours…)
- `Gym` — union of both + derived `score` and `fight_access`
- `City` — slug, region, bounds, blurb, `gym_count` (derived)

## App Router structure

```
src/app/
  page.tsx                          # Home — overview map (seed data, no API cost)
  city/[slug]/
    page.tsx                        # City view — gym list + city map
    layout.tsx                      # Parallel route shell
    @panel/
      (.)[gymSlug]/page.tsx         # Gym panel (intercepted route — modal on city page)
    [gymSlug]/page.tsx              # Gym full page (direct URL)
  api/places/photo/route.ts         # Proxy for Google Places photos
```

The overview map is a 3-level explorer: **Region → City → Gym**.

## Data files

- `src/data/gyms.ts` — `GYMS_EDITORIAL[]`, `GYMS_GOOGLE_SEED{}`, `FIGHT_ACCESS{}`
- `src/data/cities.ts` — `CITIES[]`
- `src/data/regions.ts` — region definitions
- `src/data/thailand-regions.geo.json` — choropleth polygon data
- `src/data/thailand-mask.geo.json` — greyed-out mask outside Thailand
- `src/data/islands-osm.geo.json` — island polygons from OSM

## Adding a gym

1. Add a `GymEditorial` entry to `GYMS_EDITORIAL` in `src/data/gyms.ts`
2. Add a `GymGoogle` seed entry to `GYMS_GOOGLE_SEED` (use real `place_id`, seed coordinates/rating)
3. Add a `FightAccess` entry to `FIGHT_ACCESS`
4. Optionally drop a hero image at `public/gyms/{id}.jpg`
5. Set `verified: false` until manually reviewed

## Adding a city

Add a `city(...)` call to `CITIES` in `src/data/cities.ts`. Add to `MAJOR` set if it should appear on the overview map without selecting a region first.

## Environment variables

| Variable | Purpose |
|---|---|
| `GOOGLE_PLACES_API_KEY` | Enables live Google Places hydration (optional) |

When unset, the app uses seed data silently — no errors, no degraded UI.

## Testing

See [`docs/testing.md`](docs/testing.md) for full details (test files, quirks, how to write new tests).

```bash
npm run test          # run all Playwright tests
npm run lint          # ESLint
```

Pre-push hook runs gitleaks → lint → tests automatically on `git push`.

**Known non-bugs:**
- WebGL "GPU stall due to ReadPixels" in headless console — harmless, headless-only artefact
- Gym profile page shows placeholder "C" without `public/gyms/{id}.jpg` — expected
- Mobile view clips northernmost region marker — layout-only, not a bug

**gstack browse:** `$B goto http://localhost:3000` — requires Chromium junction if shell-1208 is missing (see [docs/testing.md](docs/testing.md)).

## UI structure (verified)

The app is a 3-level map explorer: **Region → City → Gym**

| Level | URL | What renders |
|---|---|---|
| Overview | `/` | Choropleth map, region list |
| City | `/` (same page, state-driven) | City gym list + zoomed city map |
| Gym popup | `/` (intercepted route) | Map popup with summary + "View full profile" link |
| Gym full page | `/city/[slug]/[gymSlug]` | Full profile, tags, description |

Filters (Fights easy, On-site stay, Beginner-friendly, Resident fighters) and search work on the city-level gym list. Dark mode toggle is top-right.
