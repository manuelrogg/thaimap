import fs from "node:fs";
import path from "node:path";
import type {
  City,
  ExperienceLevel,
  FightAccess,
  Gym,
  GymEditorial,
  GymGoogle,
  KnownForTag,
  PriceRange,
} from "@/lib/types";
import { weightedScore } from "@/lib/ranking";
import { CITIES } from "@/data/cities";
import { FIGHT_ACCESS, GYMS_EDITORIAL, GYMS_GOOGLE_SEED } from "@/data/gyms";
import { fetchPlaceDetails, placesEnabled } from "@/lib/places";

// Data access layer — the ONE place that merges editorial (permanent) with
// Google (volatile) fields. M5 wires live hydration here behind a flag:
//   • flag off / no key            -> seed Google block (zero network, zero cost)
//   • flag on, fetch ok            -> live Google data (short-TTL cached)
//   • flag on, fetch fails/missing -> seed block (graceful fallback)
// UI code never imports the raw seed files directly.

/** Hydrate Google fields for one gym. Async because live fetch is async. */
async function hydrateGoogle(editorial: GymEditorial): Promise<GymGoogle | null> {
  const seed = GYMS_GOOGLE_SEED[editorial.id] ?? null;
  if (!placesEnabled()) return seed;
  const live = await fetchPlaceDetails(editorial.place_id);
  return live ?? seed; // fall back when not found (e.g. placeholder place_id)
}

/**
 * Auto-detect gym photos. Drop a file named after the gym id into
 * /public/gyms/ (e.g. "fa-group.jpg") and it's picked up automatically — no
 * code edit needed. Scanned once at startup (restart dev to pick up new files).
 */
let imageMap: Record<string, string> | null = null;
function gymImageFor(id: string): string | undefined {
  if (!imageMap) {
    imageMap = {};
    try {
      const dir = path.join(process.cwd(), "public", "gyms");
      for (const file of fs.readdirSync(dir)) {
        const m = file.match(/^(.+)\.(jpe?g|png|webp|avif)$/i);
        if (m) imageMap[m[1]] = `/gyms/${file}`;
      }
    } catch {
      // no folder yet — placeholders will be used
    }
  }
  return imageMap[id];
}

async function toGym(editorial: GymEditorial): Promise<Gym> {
  const google = await hydrateGoogle(editorial);
  const fa = FIGHT_ACCESS[editorial.id] ?? {
    access: "standard" as const,
    note: "Ask the gym directly about getting a fight.",
  };
  return {
    ...editorial,
    heroImage: editorial.heroImage ?? gymImageFor(editorial.id),
    google,
    score: weightedScore(google?.google_rating, google?.google_review_count),
    fight_access: fa.access,
    fight_note: fa.note,
  };
}

/** All gyms, hydrated and scored, unsorted. */
export async function getAllGyms(): Promise<Gym[]> {
  return Promise.all(GYMS_EDITORIAL.map(toGym));
}

/**
 * Cities with derived gym_count. Counts come from EDITORIAL only (no Google
 * needed), so this stays synchronous and cost-free.
 */
export function getCities(): City[] {
  return CITIES.map((c) => ({
    ...c,
    gym_count: GYMS_EDITORIAL.filter((g) => g.citySlug === c.slug).length,
  }));
}

export function getCityBySlug(slug: string): City | undefined {
  return getCities().find((c) => c.slug === slug);
}

/** Minimal gym index for global search (editorial only — no Google, no cost). */
export type GymIndexEntry = {
  name: string;
  slug: string;
  citySlug: string;
  cityName: string;
};

export function getGymIndex(): GymIndexEntry[] {
  const cityName = Object.fromEntries(CITIES.map((c) => [c.slug, c.name]));
  return GYMS_EDITORIAL.map((e) => ({
    name: e.name,
    slug: e.slug,
    citySlug: e.citySlug,
    cityName: cityName[e.citySlug] ?? e.citySlug,
  }));
}

/**
 * Lightweight per-gym data for the overview map explorer: coordinates + the
 * fields the pins/popups need. Built from SEED data only (no live Google fetch)
 * so the home map stays static and cost-free even when the Places flag is on.
 */
export type GymMapDatum = {
  id: string;
  name: string;
  citySlug: string;
  slug: string;
  lat: number;
  lng: number;
  rating: number;
  reviews: number;
  price_range: PriceRange;
  experience_level: ExperienceLevel;
  has_fighters: boolean;
  has_accommodation: boolean;
  fight_access: FightAccess;
  fight_note: string;
  known_for: KnownForTag[];
  verified: boolean;
};

export function getGymMapData(): GymMapDatum[] {
  return GYMS_EDITORIAL.map((e) => {
    const g = GYMS_GOOGLE_SEED[e.id];
    const fa = FIGHT_ACCESS[e.id];
    return {
      id: e.id,
      name: e.name,
      citySlug: e.citySlug,
      slug: e.slug,
      lat: g?.lat ?? 0,
      lng: g?.lng ?? 0,
      rating: g?.google_rating ?? 0,
      reviews: g?.google_review_count ?? 0,
      price_range: e.price_range,
      experience_level: e.experience_level,
      has_fighters: e.has_fighters,
      has_accommodation: e.has_accommodation,
      fight_access: fa?.access ?? "standard",
      fight_note: fa?.note ?? "",
      known_for: e.known_for,
      verified: e.verified,
    };
  });
}

/** Total gym count per region (derived from cities). */
export function getRegionGymCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of getCities()) {
    counts[c.region] = (counts[c.region] ?? 0) + c.gym_count;
  }
  return counts;
}

/** Gyms for a city, ranked by weighted score (highest first). */
export async function getGymsByCity(citySlug: string): Promise<Gym[]> {
  const gyms = await Promise.all(
    GYMS_EDITORIAL.filter((e) => e.citySlug === citySlug).map(toGym),
  );
  return gyms.sort((a, b) => b.score - a.score);
}

export async function getGym(
  citySlug: string,
  gymSlug: string,
): Promise<Gym | undefined> {
  const editorial = GYMS_EDITORIAL.find(
    (e) => e.citySlug === citySlug && e.slug === gymSlug,
  );
  return editorial ? toGym(editorial) : undefined;
}
