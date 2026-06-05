import type {
  ExperienceLevel,
  Gym,
  KnownForTag,
  PriceRange,
} from "@/lib/types";
import { KNOWN_FOR_TAGS } from "@/lib/types";

// Gym filtering for the city view. Filters serialize to/from URL query params so
// a filtered view is shareable, bookmarkable, and crawlable (M6 / SEO).

export type GymFilters = {
  q: string;
  level: ExperienceLevel | null;
  price: PriceRange | null;
  accommodation: boolean;
  tags: KnownForTag[];
};

export const EMPTY_FILTERS: GymFilters = {
  q: "",
  level: null,
  price: null,
  accommodation: false,
  tags: [],
};

const LEVELS: ExperienceLevel[] = ["beginner", "mixed", "advanced"];
const PRICES: PriceRange[] = ["$", "$$", "$$$"];

/** searchParams (awaited) -> typed filters. Ignores unknown values. */
export function parseFilters(
  sp: Record<string, string | string[] | undefined>,
): GymFilters {
  const one = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const level = one(sp.level) as ExperienceLevel | undefined;
  const price = one(sp.price) as PriceRange | undefined;
  const tagsRaw = one(sp.tags);
  const tags = (tagsRaw ? tagsRaw.split(",") : []).filter((t): t is KnownForTag =>
    (KNOWN_FOR_TAGS as readonly string[]).includes(t),
  );

  return {
    q: one(sp.q) ?? "",
    level: level && LEVELS.includes(level) ? level : null,
    price: price && PRICES.includes(price) ? price : null,
    accommodation: one(sp.stay) === "1",
    tags,
  };
}

/** filters -> URLSearchParams query string (omitting defaults). */
export function filtersToQuery(f: GymFilters): string {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set("q", f.q.trim());
  if (f.level) p.set("level", f.level);
  if (f.price) p.set("price", f.price);
  if (f.accommodation) p.set("stay", "1");
  if (f.tags.length) p.set("tags", f.tags.join(","));
  return p.toString();
}

/** Parse filters from a `window.location.search` string (client init). */
export function parseFiltersFromSearch(search: string): GymFilters {
  return parseFilters(Object.fromEntries(new URLSearchParams(search)));
}

export function isActive(f: GymFilters): boolean {
  return (
    !!f.q.trim() ||
    f.level !== null ||
    f.price !== null ||
    f.accommodation ||
    f.tags.length > 0
  );
}

/** Apply filters. Preserves input order (so ranking is retained). */
export function applyFilters(gyms: Gym[], f: GymFilters): Gym[] {
  const q = f.q.trim().toLowerCase();
  return gyms.filter((g) => {
    if (q && !(`${g.name} ${g.description}`.toLowerCase().includes(q))) return false;
    if (f.level && g.experience_level !== f.level) return false;
    if (f.price && g.price_range !== f.price) return false;
    if (f.accommodation && !g.has_accommodation) return false;
    if (f.tags.length && !f.tags.every((t) => g.known_for.includes(t))) return false;
    return true;
  });
}
