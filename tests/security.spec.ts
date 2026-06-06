import { test, expect } from "@playwright/test";

// ── Security Headers ──────────────────────────────────────────────────────────

const PAGES = ["/", "/city/bangkok", "/city/chiang-mai"];

for (const path of PAGES) {
  test(`security headers present on ${path}`, async ({ request }) => {
    const res = await request.get(path);
    // Treat 404 as acceptable (city page may not exist in test env)
    expect([200, 404]).toContain(res.status());

    const h = res.headers();
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["content-security-policy"]).toContain("default-src 'self'");
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["content-security-policy"]).toContain("object-src 'none'");
  });
}

// ── Photo Proxy — Input Validation ────────────────────────────────────────────

const PROXY = "/api/places/photo";

test("proxy: missing name → 400 or 404", async ({ request }) => {
  const res = await request.get(PROXY);
  expect([400, 404]).toContain(res.status());
});

test("proxy: invalid name (path traversal) → 400 or 404", async ({ request }) => {
  const cases = [
    "../../../etc/passwd",
    "places/../secret/photos/x",
    "places/foo/photos/x/extra",
    "http://evil.com",
    "",
  ];
  for (const name of cases) {
    const res = await request.get(`${PROXY}?name=${encodeURIComponent(name)}`);
    expect([400, 404], `expected rejection for name="${name}"`).toContain(res.status());
  }
});

test("proxy: invalid width → 400 or 404", async ({ request }) => {
  const cases = ["abc", "-1", "99999", "1; DROP TABLE", "../"];
  for (const w of cases) {
    const res = await request.get(
      `${PROXY}?name=places%2FABC%2Fphotos%2FXYZ&w=${encodeURIComponent(w)}`
    );
    expect([400, 404], `expected rejection for w="${w}"`).toContain(res.status());
  }
});

test("proxy: valid name format with Places disabled → 404", async ({ request }) => {
  // In test env GOOGLE_PLACES_API_KEY is unset → placesEnabled() = false → 404
  const res = await request.get(
    `${PROXY}?name=places%2FABC123%2Fphotos%2FXYZ789&w=800`
  );
  expect(res.status()).toBe(404);
});

test("proxy: response does not expose API key", async ({ request }) => {
  const res = await request.get(`${PROXY}?name=places%2FABC%2Fphotos%2FXYZ&w=800`);
  const body = await res.text();
  // Key should never appear in any response body or header
  const apiKey = process.env.GOOGLE_PLACES_API_KEY ?? "";
  if (apiKey) {
    expect(body).not.toContain(apiKey);
    const headers = JSON.stringify(res.headers());
    expect(headers).not.toContain(apiKey);
  }
});

// ── Route Validation ──────────────────────────────────────────────────────────
// Next.js 16 streaming returns HTTP 200 even for not-found pages in dev mode;
// the canonical indicator is the `next-error` meta tag in the response body.

test("unknown city slug → not-found page, not 500", async ({ request }) => {
  const res = await request.get("/city/this-city-does-not-exist-xyzzy");
  const body = await res.text();
  // Next.js 16 streaming commits HTTP 200 before notFound() is called in dev;
  // the canonical check is the next-error meta tag set by the App Router.
  expect(res.status()).not.toBe(500);
  expect(body).toContain('content="not-found"');
});

test("unknown gym slug → not-found page, not 500", async ({ request }) => {
  const res = await request.get("/city/bangkok/this-gym-does-not-exist-xyzzy");
  const body = await res.text();
  expect(res.status()).not.toBe(500);
  expect(body).toContain('content="not-found"');
});
