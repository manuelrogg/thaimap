import type { MetadataRoute } from "next";
import { getCities, getGymIndex } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

// Sitemap — home, every city, every gym. Uses the editorial index (no Google
// calls, no cost).
export default function sitemap(): MetadataRoute.Sitemap {
  const cities = getCities();
  const gyms = getGymIndex();
  return [
    { url: SITE_URL, priority: 1 },
    ...cities.map((c) => ({
      url: `${SITE_URL}/city/${c.slug}`,
      priority: 0.8,
    })),
    ...gyms.map((g) => ({
      url: `${SITE_URL}/city/${g.citySlug}/${g.slug}`,
      priority: 0.6,
    })),
  ];
}
