// Core domain types for MuayThaiGuide.
//
// IMPORTANT — two data sources are kept physically separate (see project brief):
//   • Editorial  -> curated by us, committed to the repo, kept FOREVER.
//   • Google     -> fetched from Google Places by place_id, short-lived cache,
//                   refreshed at runtime. Per Google ToS we may persist ONLY the
//                   place_id long-term; ratings/photos/reviews are volatile.
//
// `place_id` is the single join key between the two.

export type Region =
  | "North"
  | "Isaan"
  | "Central"
  | "East Coast"
  | "West"
  | "South & Islands";

export type PriceRange = "$" | "$$" | "$$$";

export type ExperienceLevel = "beginner" | "mixed" | "advanced";

/**
 * How readily a visiting foreigner can actually get a fight booked:
 *   quick     - capable trainees matched fast (often ~1 week)
 *   standard  - after a few weeks of training / a trial
 *   selective - need real experience or the coach's approval
 *   rare      - tourist/beginner focus; fights aren't really on offer
 */
export type FightAccess = "quick" | "standard" | "selective" | "rare";

/** Curated tags. Kept as a const tuple so filters in M6 can iterate the full set. */
export const KNOWN_FOR_TAGS = [
  "fighter-focused",
  "beginner-friendly",
  "clinch",
  "technical",
  "authentic",
  "tourist-friendly",
  "conditioning",
  "weight-loss",
  "kids-classes",
  "private-sessions",
] as const;

export type KnownForTag = (typeof KNOWN_FOR_TAGS)[number];

export type Trainer = {
  name: string;
  note?: string;
};

/** PERMANENT. We own this. Edited by hand, committed, kept indefinitely. */
export type GymEditorial = {
  /** Our stable slug id, e.g. "fa-group". Unique within a city. */
  id: string;
  /** Google's stable Place ID — the ONLY Google field we persist long-term. */
  place_id: string;
  name: string;
  /** FK -> City.slug */
  citySlug: string;
  /** URL segment, unique within the city. */
  slug: string;
  /**
   * Optional main photo we host ourselves, e.g. "/gyms/fa-group.jpg" (file in
   * /public/gyms/). Shown as the single hero image on the profile. When unset,
   * we fall back to a Google photo (M5) or a placeholder.
   */
  heroImage?: string;
  description: string;
  known_for: KnownForTag[];
  /** Lineage / training approach, a sentence or two. */
  style: string;
  trainers: Trainer[];
  price_range: PriceRange;
  /** Optional free-text e.g. "~350 THB/session, 9000 THB/month". */
  price_note?: string;
  has_accommodation: boolean;
  experience_level: ExperienceLevel;
  /** Do active competitive (local/stadium) fighters train here? */
  has_fighters: boolean;
  /**
   * Editorial has been human-reviewed and is safe to show publicly. Newly
   * seeded gyms default to false so they can be surfaced with an "unverified"
   * marker and checked before launch. Treat undefined as true (legacy).
   */
  verified: boolean;
};

export type GooglePhoto = {
  /** Photo resource name / reference (NOT a long-term cached binary). */
  ref: string;
  /** Required attribution string from Google. */
  attribution: string;
  width?: number;
  height?: number;
};

/** VOLATILE. Fetched from Google Places, short-TTL cache, refreshed. */
export type GymGoogle = {
  place_id: string;
  lat: number;
  lng: number;
  google_rating: number;
  google_review_count: number;
  photos: GooglePhoto[];
  /** Google's localized opening-hours lines, if available. */
  hours_weekday_text?: string[];
  website?: string;
  phone?: string;
  google_maps_url: string;
  /** ISO timestamp of last sync, or "seed" for placeholder data. */
  last_synced: string;
};

/**
 * What the UI consumes: editorial joined with hydrated Google fields.
 * `google` is null when no data is available (API off + no seed) so the UI
 * can degrade gracefully.
 */
export type Gym = GymEditorial & {
  google: GymGoogle | null;
  /** Derived weighted ranking score (see lib/ranking.ts). 0 when no Google data. */
  score: number;
  /** How easily a visiting foreigner can get a fight here. */
  fight_access: FightAccess;
  /** One honest line on the fight-booking reality. */
  fight_note: string;
};

export type LatLng = { lat: number; lng: number };

export type Bounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type City = {
  /** URL segment + FK target, e.g. "bangkok". */
  slug: string;
  name: string;
  region: Region;
  center: LatLng;
  /** For zoom-to-city in the map view. */
  bounds: Bounds;
  /** Short editorial blurb for the city page / SEO. */
  blurb: string;
  /** Major hub — shown on the zoomed-out overview map. Smaller cities only
   *  appear once their region is selected (keeps the overview uncluttered). */
  major: boolean;
  /** Derived at load time from the gym list. */
  gym_count: number;
};
