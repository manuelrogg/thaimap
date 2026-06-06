import { test, expect } from "@playwright/test";

test("homepage loads and shows map", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Muay Thai|MuayThai|thaimap/i);
  await expect(page.locator("canvas")).toBeVisible({ timeout: 10_000 });
});

test("region list is visible on load", async ({ page }) => {
  await page.goto("/");
  // Sidebar shows region buttons: North, Central, South & Islands, etc.
  const regions = page.getByRole("button").filter({ hasText: /North|Central|South|Isaan|West|East/i });
  await expect(regions.first()).toBeVisible({ timeout: 10_000 });
});

test("dark mode toggle switches map style", async ({ page }) => {
  await page.goto("/");
  // The toggle button aria-label reflects the NEXT state ("Switch to dark map" → currently light)
  const toggle = page.getByRole("button", { name: /Switch to (dark|light) map/i });
  await expect(toggle).toBeVisible({ timeout: 5_000 });

  const labelBefore = await toggle.getAttribute("aria-label");
  await toggle.click();
  // After click the label should flip (dark↔light)
  await expect(toggle).not.toHaveAttribute("aria-label", labelBefore!);
});

test("clicking a region reveals city list", async ({ page }) => {
  await page.goto("/");
  // Click a region that exists in the data
  const regionBtn = page.getByRole("button").filter({ hasText: /Central/i }).first();
  await expect(regionBtn).toBeVisible({ timeout: 10_000 });
  await regionBtn.click();
  // After clicking a region, city-level buttons should appear
  await expect(page.getByRole("button").filter({ hasText: /gyms/i }).first()).toBeVisible({
    timeout: 5_000,
  });
});
