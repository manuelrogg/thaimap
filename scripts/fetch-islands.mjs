// Fetch REAL island coastlines from OpenStreetMap (Overpass API) for the
// tourist islands, simplify to ~30% (to match the mainland), and write a small
// committed GeoJSON the region build consumes. No synthetic discs — ever.
//
// Run: npm run fetch:islands   (writes src/data/islands-osm.geo.json)

import osmtogeojson from "osmtogeojson";
import mapshaper from "mapshaper";
import * as turf from "@turf/turf";
import { readFileSync, writeFileSync } from "node:fs";

const ENDPOINT = "https://overpass-api.de/api/interpreter";
const UA = "MuayThaiGuide-region-build/1.0";

// place=island ways + relations within each island's bbox (south,west,north,east).
const QUERY = `[out:json][timeout:120];(
 way["place"="island"](7.75,98.25,8.20,98.45);relation["place"="island"](7.75,98.25,8.20,98.45);
 way["place"="island"](9.40,99.93,9.62,100.10);relation["place"="island"](9.40,99.93,9.62,100.10);
 way["place"="island"](9.65,99.95,9.80,100.08);relation["place"="island"](9.65,99.95,9.80,100.08);
 way["place"="island"](10.04,99.78,10.16,99.92);relation["place"="island"](10.04,99.78,10.16,99.92);
 way["place"="island"](7.45,98.95,7.75,99.15);relation["place"="island"](7.45,98.95,7.75,99.15);
 way["place"="island"](7.95,98.50,8.28,98.72);relation["place"="island"](7.95,98.50,8.28,98.72);
);out geom;`;

// The islands we want (by OSM name). Ko Lanta = Yai (+ Noi); Ko Yao = Yai + Noi.
const WANT = new Set([
  "Ko Phuket",
  "Ko Samui",
  "Ko Pha-ngan",
  "Ko Tao",
  "Ko Lanta Yai",
  "Ko Lanta Noi",
  "Ko Yao Yai",
  "Ko Yao Noi",
]);

let raw;
try {
  raw = readFileSync("./.tmp_islands_all.json", "utf8");
} catch {
  console.log("Querying Overpass for island coastlines…");
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
    body: "data=" + encodeURIComponent(QUERY),
  });
  raw = await res.text();
  if (raw.trimStart().startsWith("<")) {
    console.error("Overpass returned an error page (rate limited?). Try again later.");
    process.exit(1);
  }
  writeFileSync("./.tmp_islands_all.json", raw);
}

const gj = osmtogeojson(JSON.parse(raw));
const islands = gj.features
  .filter((f) => {
    const nm = f.properties?.["name:en"] || f.properties?.name;
    return WANT.has(nm) && (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon");
  })
  .map((f) => ({
    type: "Feature",
    properties: { island: f.properties["name:en"] || f.properties.name },
    geometry: f.geometry,
  }));

if (!islands.length) {
  console.error("No target islands found in Overpass response.");
  process.exit(1);
}

// Simplify to ~30% retention (mainland style), repair, trim precision.
const res = await mapshaper.applyCommands(
  "-i in.json -simplify 30% keep-shapes -clean -o out.json format=geojson",
  { "in.json": JSON.stringify({ type: "FeatureCollection", features: islands }) },
);
const out = JSON.parse(res["out.json"].toString());
out.features = out.features.map((f) => turf.truncate(f, { precision: 4, coordinates: 2 }));

writeFileSync("./src/data/islands-osm.geo.json", JSON.stringify(out));
console.log(
  "Islands written:",
  out.features.map((f) => `${f.properties.island} (${(turf.area(f) / 1e6).toFixed(0)}km²)`).join(", "),
);
