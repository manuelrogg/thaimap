// Build clean region GeoJSON from Natural Earth 10m admin-1 (public domain).
//
// Run:    npm run build:regions
// Source: nvkelso/natural-earth-vector ne_10m_admin_1 (Thailand subset),
//         auto-downloaded to ./.tmp_ne.json (~40 MB, cached).
// Output: ./src/data/thailand-regions.geo.json  (6 regions)
//
// Approach:
//  • Mainland provinces are dissolved into regions from ONE shared topology and
//    simplified together (mapshaper -dissolve -simplify 30% keep-shapes -clean),
//    so neighbours share identical borders (no gaps/overlaps) and self-overlaps
//    are repaired (no shards). NE 10m is high-res so coastlines stay smooth.
//  • The low-res NE island parts (Phuket province + Samui/Phangan/Lanta) are
//    peeled out of the mainland and discarded; the tourist islands are drawn
//    from REAL OpenStreetMap coastlines (src/data/islands-osm.geo.json, built by
//    scripts/fetch-islands.mjs) and merged into "South & Islands". No synthetic
//    geometry — run `npm run fetch:islands` to refresh the island outlines.

import mapshaper from "mapshaper";
import * as turf from "@turf/turf";
import { readFileSync, writeFileSync } from "node:fs";

const SOURCE_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson";

// Natural Earth province `name` -> region.
const GROUPS = {
  North: ["Chiang Mai", "Chiang Rai", "Lampang", "Lamphun", "Mae Hong Son", "Nan", "Phayao", "Phrae", "Uttaradit"],
  Isaan: ["Amnat Charoen", "Bueng Kan", "Buri Ram", "Chaiyaphum", "Kalasin", "Khon Kaen", "Loei", "Maha Sarakham", "Mukdahan", "Nakhon Phanom", "Nakhon Ratchasima", "Nong Bua Lam Phu", "Nong Khai", "Roi Et", "Sakon Nakhon", "Si Sa Ket", "Surin", "Ubon Ratchathani", "Udon Thani", "Yasothon"],
  Central: ["Bangkok Metropolis", "Ang Thong", "Phra Nakhon Si Ayutthaya", "Chai Nat", "Kamphaeng Phet", "Lop Buri", "Nakhon Nayok", "Nakhon Pathom", "Nakhon Sawan", "Nonthaburi", "Pathum Thani", "Phetchabun", "Phichit", "Phitsanulok", "Samut Prakan", "Samut Sakhon", "Samut Songkhram", "Saraburi", "Sing Buri", "Sukhothai", "Suphan Buri", "Tak", "Uthai Thani"],
  "East Coast": ["Chachoengsao", "Chanthaburi", "Chon Buri", "Prachin Buri", "Rayong", "Sa Kaeo", "Trat"],
  West: ["Kanchanaburi", "Phetchaburi", "Prachuap Khiri Khan", "Ratchaburi"],
  "South & Islands": ["Chumphon", "Krabi", "Nakhon Si Thammarat", "Narathiwat", "Pattani", "Phangnga", "Phatthalung", "Phuket", "Ranong", "Satun", "Songkhla", "Surat Thani", "Trang", "Yala"],
};

// NOTE: region COLOURS live in the app (src/data/regions.ts → REGION_META),
// the single source of truth used by both the legend and the polygon fill. This
// build only produces geometry + label + bbox — no colours baked in.

const REGION_ORDER = ["North", "Isaan", "Central", "East Coast", "West", "South & Islands"];

// Island sub-polygons (of southern provinces) to keep at light simplification.
const ISLAND_BBOXES = [
  [99.93, 9.42, 100.08, 9.58], // Koh Samui
  [99.96, 9.66, 100.08, 9.79], // Koh Phangan
  [99.0, 7.46, 99.13, 7.72], // Koh Lanta
  [98.7, 7.66, 98.82, 7.78], // Phi Phi
];

// City centres used to verify each falls inside its region polygon.
const VERIFY = {
  "South & Islands": [
    [98.3381, 7.9519], // Phuket
    [100.0136, 9.512], // Koh Samui
    [100.0136, 9.7319], // Koh Phangan
    [99.8405, 10.0956], // Koh Tao
    [98.9063, 8.0863], // Krabi
    [99.05, 7.6167], // Koh Lanta
    [99.3215, 9.1382], // Surat Thani
  ],
  North: [[98.9853, 18.7883]], // Chiang Mai
  Isaan: [[102.836, 16.4419]], // Khon Kaen
  Central: [[100.5018, 13.7563]], // Bangkok
  "East Coast": [[100.8825, 12.9236]], // Pattaya
  West: [[99.9577, 12.5684]], // Hua Hin
};

const REGION_OF = {};
for (const [region, names] of Object.entries(GROUPS)) {
  for (const n of names) REGION_OF[n] = region;
}

const inBbox = (c, b) => c[0] >= b[0] && c[0] <= b[2] && c[1] >= b[1] && c[1] <= b[3];

function dropSmallParts(feature, minFrac) {
  if (feature.geometry.type !== "MultiPolygon") return feature;
  const polys = feature.geometry.coordinates.map((c) => turf.polygon(c));
  const areas = polys.map((p) => turf.area(p));
  const total = areas.reduce((a, b) => a + b, 0);
  const kept = polys.filter((_, i) => areas[i] >= minFrac * total);
  if (kept.length <= 1) return kept[0] ?? feature;
  return turf.multiPolygon(kept.map((p) => p.geometry.coordinates));
}

const polysOf = (feature) =>
  feature.geometry.type === "Polygon"
    ? [feature.geometry.coordinates]
    : feature.geometry.coordinates;

// --- Load Natural Earth (Thailand subset) ---
let raw;
try {
  raw = readFileSync("./.tmp_ne.json", "utf8");
} catch {
  console.log("Downloading Natural Earth 10m admin-1 from", SOURCE_URL);
  raw = await (await fetch(SOURCE_URL)).text();
}
const ne = JSON.parse(raw);
const provinces = ne.features.filter((f) => f.properties.adm0_a3 === "THA");

// --- Explode provinces into mainland-only features ---
// The low-res NE island parts (Phuket province + Samui/Phangan/Lanta) are
// PEELED OUT and discarded — the islands are drawn from real OSM coastlines
// (see below). This keeps the southern mainland a clean peninsula.
const mainland = { type: "FeatureCollection", features: [] };
const unmatched = [];
for (const f of provinces) {
  const name = f.properties.name;
  const region = REGION_OF[name];
  if (!region) {
    unmatched.push(name);
    continue;
  }
  for (const coords of polysOf(f)) {
    const poly = turf.polygon(coords);
    const c = turf.centroid(poly).geometry.coordinates;
    const isIsland = name === "Phuket" || ISLAND_BBOXES.some((b) => inBbox(c, b));
    if (isIsland) continue; // drawn from real OSM coastlines instead
    mainland.features.push({ type: "Feature", properties: { region }, geometry: poly.geometry });
  }
}
if (unmatched.length) {
  console.error("UNMATCHED provinces:", [...new Set(unmatched)]);
  process.exit(1);
}

// --- Mainland: one shared-topology mapshaper pass ---
const cmd =
  // 30% retention: mapshaper's `5%` keeps only 5% of vertices (jagged coast);
  // 30% follows the real shoreline smoothly while staying small.
  "-i in.json snap -dissolve region -simplify 30% keep-shapes -clean -o out.json format=geojson";
const result = await mapshaper.applyCommands(cmd, { "in.json": JSON.stringify(mainland) });
const dissolved = JSON.parse(result["out.json"].toString());

// --- Real island coastlines from OpenStreetMap (scripts/fetch-islands.mjs) ---
// Phuket, Koh Samui, Koh Phangan, Koh Tao, Koh Lanta — actual OSM outlines,
// already simplified to ~30%. No synthetic discs.
const islandFC = JSON.parse(readFileSync("./src/data/islands-osm.geo.json", "utf8"));
const islandPolys = islandFC.features.flatMap((f) => polysOf(f));

// --- Assemble final regions ---
const features = [];
for (const region of REGION_ORDER) {
  let f = dissolved.features.find((x) => x.properties.region === region);
  if (!f) {
    console.error(`No geometry for region "${region}"`);
    process.exit(1);
  }
  f = dropSmallParts(f, 0.005);

  // Merge the real OSM islands into South & Islands as one MultiPolygon.
  if (region === "South & Islands") {
    f = turf.multiPolygon([...polysOf(f), ...islandPolys]);
  }

  f = turf.truncate(f, { precision: 3, coordinates: 2 });

  let pt = turf.centerOfMass(f);
  if (!turf.booleanPointInPolygon(pt, f)) pt = turf.pointOnFeature(f);
  const label = turf.truncate(pt, { precision: 3 }).geometry.coordinates;
  const bbox = turf.bbox(f).map((n) => Math.round(n * 1000) / 1000);
  const parts = f.geometry.type === "Polygon" ? 1 : f.geometry.coordinates.length;

  features.push({
    type: "Feature",
    properties: { id: region, label, bbox, parts },
    geometry: f.geometry,
  });
}

const out = { type: "FeatureCollection", features };
const json = JSON.stringify(out);

// --- Verify ---
let ok = true;
const TH = [97.3, 5.5, 105.7, 20.6]; // Thailand bbox (spillover guard)
for (const f of features) {
  // 1. city centres inside their region
  for (const c of VERIFY[f.properties.id] ?? []) {
    if (!turf.booleanPointInPolygon(turf.point(c), f)) {
      console.error(`  FAIL: [${c[1]},${c[0]}] not inside ${f.properties.id}`);
      ok = false;
    }
  }
  // 2. no geometry outside Thailand
  const [w, s, e, n] = f.properties.bbox;
  if (w < TH[0] || s < TH[1] || e > TH[2] || n > TH[3]) {
    console.error(`  FAIL: ${f.properties.id} bbox extends outside Thailand: [${w},${s},${e},${n}]`);
    ok = false;
  }
  // 3. label on land (inside its own polygon)
  if (!turf.booleanPointInPolygon(turf.point(f.properties.label), f)) {
    console.error(`  FAIL: ${f.properties.id} label not on its polygon`);
    ok = false;
  }
}

writeFileSync("./src/data/thailand-regions.geo.json", json);
console.log("Regions:", features.map((f) => `${f.properties.id}(${f.properties.parts}p)`).join(", "));
console.log("Output size:", json.length, "bytes");
console.log(ok ? "VERIFY: all checks passed ✓" : "VERIFY: FAILURES ✗");
if (!ok) process.exit(1);
