// Google Places API (New) client — server-only.
//
// COST / ToS NOTES (verified against current Google docs, 2026):
//   • Endpoint: GET https://places.googleapis.com/v1/places/{placeId}
//     Headers: X-Goog-Api-Key, X-Goog-FieldMask (comma-separated, NO spaces).
//   • Billing is per request AND scales with the field mask — you're billed at
//     the HIGHEST SKU tier among the fields you request. So we request the
//     minimum set we actually render. The old $200 monthly credit ended
//     Feb 2025; every request now bills. Refresh infrequently.
//   • Google ToS forbids long-term caching of ratings/reviews/photos. We cache
//     in-memory with a short TTL only, and persist nothing to disk. (In a
//     multi-instance deploy, replace this with a shared short-TTL cache or a
//     scheduled refresh job — see README.)
//
// The whole module is inert unless ENABLE_GOOGLE_PLACES=true AND a key is set;
// otherwise the data layer keeps using seed data and no network call is made.

import type { GymGoogle } from "@/lib/types";

const BASE = "https://places.googleapis.com/v1";

/** Minimal field mask — keep tight to control SKU cost. */
const FIELD_MASK = [
  "id",
  "location",
  "rating",
  "userRatingCount",
  "regularOpeningHours.weekdayDescriptions",
  "websiteUri",
  "internationalPhoneNumber",
  "googleMapsUri",
  "photos",
].join(",");

/** Short-lived cache window (ToS-compliant). */
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

export function placesEnabled(): boolean {
  return (
    process.env.ENABLE_GOOGLE_PLACES === "true" &&
    !!process.env.GOOGLE_PLACES_API_KEY
  );
}

// --- Google response shape (only the fields we mask for) ---
type PlaceDetailsResponse = {
  id?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  websiteUri?: string;
  internationalPhoneNumber?: string;
  googleMapsUri?: string;
  photos?: {
    name: string;
    widthPx?: number;
    heightPx?: number;
    authorAttributions?: { displayName?: string }[];
  }[];
};

type CacheEntry = { data: GymGoogle | null; exp: number };
const cache = new Map<string, CacheEntry>();

/** Build the URL for our own photo proxy (keeps the API key server-side). */
function photoProxyUrl(name: string, maxWidthPx = 800): string {
  return `/api/places/photo?name=${encodeURIComponent(name)}&w=${maxWidthPx}`;
}

function mapResponse(placeId: string, r: PlaceDetailsResponse): GymGoogle {
  return {
    place_id: r.id ?? placeId,
    lat: r.location?.latitude ?? 0,
    lng: r.location?.longitude ?? 0,
    google_rating: r.rating ?? 0,
    google_review_count: r.userRatingCount ?? 0,
    photos: (r.photos ?? []).slice(0, 6).map((p) => ({
      ref: photoProxyUrl(p.name),
      attribution: p.authorAttributions?.[0]?.displayName ?? "",
      width: p.widthPx,
      height: p.heightPx,
    })),
    hours_weekday_text: r.regularOpeningHours?.weekdayDescriptions,
    website: r.websiteUri,
    phone: r.internationalPhoneNumber,
    google_maps_url:
      r.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    last_synced: new Date().toISOString(),
  };
}

/**
 * Fetch + map one place. Returns null on any failure (not-found, rate limit,
 * network) so the caller can fall back to seed data. Never throws.
 */
export async function fetchPlaceDetails(placeId: string): Promise<GymGoogle | null> {
  if (!placesEnabled()) return null;

  const now = Date.now();
  const hit = cache.get(placeId);
  if (hit && hit.exp > now) return hit.data;

  let data: GymGoogle | null = null;
  try {
    const res = await fetch(`${BASE}/places/${encodeURIComponent(placeId)}`, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      // Next caches fetches by default; we manage freshness ourselves.
      cache: "no-store",
    });

    if (res.ok) {
      data = mapResponse(placeId, (await res.json()) as PlaceDetailsResponse);
    } else {
      // 404 = bad/placeholder id; 429 = rate limited; 4xx/5xx = other.
      console.warn(`[places] ${placeId} -> HTTP ${res.status}; falling back to seed`);
    }
  } catch (err) {
    console.warn(`[places] ${placeId} fetch failed; falling back to seed`, err);
  }

  cache.set(placeId, { data, exp: now + CACHE_TTL_MS });
  return data;
}
