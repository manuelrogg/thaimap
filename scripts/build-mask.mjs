// Build the "spotlight Thailand" mask: a big world-box polygon with Thailand
// punched out, so the app can dim everything OUTSIDE Thailand while the country
// stays bright.
//
// Run: npm run build:mask   (reads the committed regions file — no NE download)
// Input:  ./src/data/thailand-regions.geo.json
// Output: ./src/data/thailand-mask.geo.json
//
// Re-run after `npm run build:regions` if the region geometry changes, so the
// mask's Thailand-shaped hole stays aligned with the region outlines.

import * as turf from "@turf/turf";
import { readFileSync, writeFileSync } from "node:fs";

const fc = JSON.parse(readFileSync("./src/data/thailand-regions.geo.json", "utf8"));

// Union all 6 regions into Thailand's outline (mainland + islands). Their shared
// borders are identical (built from one topology), so the union is clean and the
// hole edge matches the region fills exactly.
const thailand = turf.union(
  turf.featureCollection(fc.features.map((f) => turf.feature(f.geometry))),
);

// World box covering the whole pannable area (well beyond maxBounds).
const box = turf.polygon([
  [
    [80, -10],
    [120, -10],
    [120, 30],
    [80, 30],
    [80, -10],
  ],
]);

const mask = turf.difference(turf.featureCollection([box, thailand]));
if (!mask) {
  console.error("difference() returned null");
  process.exit(1);
}

// Trim coordinate precision a touch to keep the file small.
const trimmed = turf.truncate(mask, { precision: 4, coordinates: 2 });

const out = {
  type: "FeatureCollection",
  features: [{ type: "Feature", properties: {}, geometry: trimmed.geometry }],
};
const json = JSON.stringify(out);
writeFileSync("./src/data/thailand-mask.geo.json", json);

const parts =
  trimmed.geometry.type === "Polygon" ? 1 : trimmed.geometry.coordinates.length;
console.log(`Mask written: ${trimmed.geometry.type} (${parts} part), ${json.length} bytes`);
