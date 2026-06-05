import type { Bounds, LatLng, Region } from "@/lib/types";
import rawFC from "@/data/thailand-regions.geo.json";
import rawMask from "@/data/thailand-mask.geo.json";

// Region shapes are built OFFLINE from real Thailand province boundaries
// (apisit/thailand.json) by scripts/build-regions.mjs using mapshaper: provinces
// are dissolved into regions from ONE shared topology and simplified together
// (so neighbours share identical borders — no gaps/overlaps), and `-clean`
// repairs self-intersections. The Islands region is a MultiPolygon of the real
// island outlines (Phuket, Samui, Phangan, Lanta). Output: thailand-regions.geo.json
// with an on-land label point + bbox per region. To regenerate: `npm run build:regions`.
// Do NOT hand-edit the JSON.

type RegionFeature = {
  type: "Feature";
  properties: {
    id: Region;
    bbox: [number, number, number, number]; // [west, south, east, north]
  };
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
};
type RegionFC = { type: "FeatureCollection"; features: RegionFeature[] };

const FC = rawFC as unknown as RegionFC;

// Area-weighted centroid (centre of mass) of a single ring — same formula as
// turf.centerOfMass, dependency-free.
function ringCentroid(ring: number[][]): { lng: number; lat: number; area: number } {
  let twiceArea = 0;
  let x = 0;
  let y = 0;
  for (let i = 0, n = ring.length - 1; i < n; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[i + 1];
    const cross = x0 * y1 - x1 * y0;
    twiceArea += cross;
    x += (x0 + x1) * cross;
    y += (y0 + y1) * cross;
  }
  if (Math.abs(twiceArea) < 1e-12) {
    // Degenerate ring → fall back to the vertex average.
    const m = Math.max(ring.length - 1, 1);
    const sx = ring.slice(0, m).reduce((s, p) => s + p[0], 0);
    const sy = ring.slice(0, m).reduce((s, p) => s + p[1], 0);
    return { lng: sx / m, lat: sy / m, area: 0 };
  }
  return { lng: x / (3 * twiceArea), lat: y / (3 * twiceArea), area: Math.abs(twiceArea / 2) };
}

/**
 * Label anchor for a region, computed DIRECTLY from that region's own polygon
 * (its largest part's centre of mass) — so the pill is always glued to the
 * shape the map renders. No stored/hardcoded coordinates.
 */
function regionLabel(geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): LatLng {
  const polygons =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  let best = { lng: 0, lat: 0, area: -1 };
  for (const poly of polygons) {
    const c = ringCentroid(poly[0]); // outer ring of this part
    if (c.area > best.area) best = c;
  }
  return { lat: best.lat, lng: best.lng };
}

// ─── SINGLE SOURCE OF TRUTH for region display ───────────────────────────────
// One config maps each region → colour + display name. Used by BOTH the sidebar
// legend AND the polygon fill (injected into the GeoJSON below), so they can
// never drift apart. Colours are NOT baked into the geometry JSON.
// `color` = translucent polygon fill + legend dot. `pill` = darker solid colour
// for the region label pill (white text stays legible on it).
const REGION_META: Record<Region, { name: string; color: string; pill: string }> = {
  North: { name: "North", color: "#37b24d", pill: "#5C8F1F" }, // green
  Isaan: { name: "Isaan (Northeast)", color: "#f08c00", pill: "#C77F12" }, // orange
  Central: { name: "Central", color: "#1c7ed6", pill: "#1E6FBE" }, // blue
  "East Coast": { name: "East Coast", color: "#0ca678", pill: "#138C66" }, // teal
  West: { name: "West", color: "#7048e8", pill: "#5E55C0" }, // purple
  "South & Islands": { name: "South & Islands", color: "#e64980", pill: "#CE4E78" }, // pink
};

export type RegionDef = {
  id: Region;
  name: string;
  color: string; // polygon fill + legend dot
  pill: string; // solid pill background
  label: LatLng;
  bounds: Bounds;
};

export const REGIONS: RegionDef[] = FC.features.map((f) => {
  const id = f.properties.id;
  const [west, south, east, north] = f.properties.bbox;
  return {
    id,
    name: REGION_META[id].name,
    color: REGION_META[id].color,
    pill: REGION_META[id].pill,
    // Computed from THIS feature's own polygon — never a stored/zipped value.
    label: regionLabel(f.geometry),
    bounds: { north, south, east, west },
  };
});

/** Bounds for zoom-to-region (precomputed bbox of the real geometry). */
export function regionBounds(r: RegionDef): Bounds {
  return r.bounds;
}

/** "Spotlight" mask — world box with Thailand punched out (see build-mask.mjs). */
export function maskGeoJSON() {
  return rawMask as unknown as GeoJSON.FeatureCollection;
}

/**
 * Polygon FeatureCollection for the map. Injects the colour + count from the
 * single REGION_META config, so the fill always matches the legend.
 */
export function regionsGeoJSON(counts: Record<string, number>) {
  return {
    type: "FeatureCollection" as const,
    features: FC.features.map((f) => ({
      ...f,
      properties: {
        ...f.properties,
        color: REGION_META[f.properties.id].color,
        count: counts[f.properties.id] ?? 0,
      },
    })),
  };
}
