import type { LngLatBoundsLike, StyleSpecification } from "maplibre-gl";
import type { Bounds } from "@/lib/types";

// Map configuration. Kept separate from components so the tile source / style is
// swappable in one place.
//
// BASEMAP: CARTO "Voyager — no labels" raster tiles. We strip the basemap's
// place/POI text so the map isn't cluttered with every town and neighbouring
// country; our own region pills + a few key Thai city labels are added back in
// MapExplorer. Free, no API key.

const cartoTiles = (style: string) =>
  ["a", "b", "c", "d"].map(
    (s) => `https://${s}.basemaps.cartocdn.com/rastertiles/${style}/{z}/{x}/{y}.png`,
  );

/** Light and dark no-label raster tile sets — swapped in place via setTiles(). */
export const BASEMAP_TILES = {
  light: cartoTiles("voyager_nolabels"),
  dark: cartoTiles("dark_nolabels"),
} as const;

export const BASEMAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [...BASEMAP_TILES.light],
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [{ id: "carto", type: "raster", source: "carto" }],
};

/** Bounding box of Thailand, for the overview fitBounds. [[sw],[ne]] = [lng,lat]. */
export const THAILAND_BOUNDS: [[number, number], [number, number]] = [
  [97.3, 5.5],
  [105.7, 20.6],
];

/**
 * Hard pan limit — a snug margin around Thailand so the focus stays on the
 * country and little of the surrounding region is pannable into view.
 */
export const THAILAND_MAX_BOUNDS: LngLatBoundsLike = [
  [91.0, 2.0],
  [111.0, 23.0],
];

/** Zoom limits for the overview map. Lower min => can sit more zoomed out. */
export const THAILAND_ZOOM = { min: 3.2, max: 12 };

/** Pixel margin used when framing the whole country (larger => more zoomed out). */
export const THAILAND_FIT_PADDING = 110;

/** Zoom limits for a city map. */
export const CITY_ZOOM = { min: 9, max: 17 };

/** Convert our north/south/east/west bounds to MapLibre's [[sw],[ne]] form. */
export function toLngLatBounds(b: Bounds): [[number, number], [number, number]] {
  return [
    [b.west, b.south],
    [b.east, b.north],
  ];
}

/** Pad a bounds box outward by `factor` of its size (for a city's pan limit). */
export function padBounds(b: Bounds, factor = 0.5): LngLatBoundsLike {
  const dx = (b.east - b.west) * factor;
  const dy = (b.north - b.south) * factor;
  return [
    [b.west - dx, b.south - dy],
    [b.east + dx, b.north + dy],
  ];
}
