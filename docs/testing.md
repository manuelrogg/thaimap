# Testing

## Run tests

```bash
npm run test              # all Playwright tests (starts dev server automatically)
npm run test -- --ui      # interactive Playwright UI
npm run test -- --headed  # watch browser run tests
```

Tests auto-start `npm run dev` if no server is running on port 3000.

## Test files

| File | What it covers |
|---|---|
| `tests/home.spec.ts` | Map renders, region list, dark mode toggle, region→city drill-down |
| `tests/security.spec.ts` | Security headers, photo proxy input validation, not-found routing |

## Pre-push hook

`.git/hooks/pre-push` runs on every `git push`:
1. **gitleaks** — secret scan (skips with warning if not installed)
2. **ESLint** — `npm run lint`
3. **Playwright** — `npm run test`

Push is aborted if any step fails.

## Known quirks

### Next.js 16 streaming + notFound()
HTTP status is always 200 in dev (committed before `notFound()` fires). Check
`content="not-found"` meta tag instead:
```ts
expect(body).toContain('content="not-found"');
expect(res.status()).not.toBe(500);
```

### MapLibre tiles need `connect-src`, not `img-src`
MapLibre loads raster tiles via `fetch()`, not `<img>`. CSP must include:
```
connect-src 'self' *.basemaps.cartocdn.com
```
`img-src *.basemaps.cartocdn.com` alone is not enough.

### Dark mode has no HTML class
Dark mode only swaps MapLibre tile sources; no class is added to `<html>`.
Test the `aria-label` flip on the toggle button instead.

### Harmless console noise (ignore in tests)
- `eval() is not supported` — React dev mode only, never in production
- `GPU stall due to ReadPixels` — WebGL headless artefact (also in CLAUDE.md)

## Writing a new test

```ts
import { test, expect } from "@playwright/test";

test("my new test", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible({ timeout: 10_000 });
});
```

Security / API tests use `request` (no browser):
```ts
test("my api test", async ({ request }) => {
  const res = await request.get("/api/places/photo");
  expect(res.status()).toBe(400);
});
```

## Playwright config

`playwright.config.ts` — Chromium only, `baseURL: http://localhost:3000`.
Dev server reused if already running; CI gets a fresh start every time.
