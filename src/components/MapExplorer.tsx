"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Star } from "lucide-react";
import type { Map as MlMap, Marker, Popup } from "maplibre-gl";
import type { City, Region } from "@/lib/types";
import type { GymMapDatum } from "@/lib/data";
import {
  BASEMAP_STYLE,
  THAILAND_BOUNDS,
  THAILAND_MAX_BOUNDS,
  toLngLatBounds,
} from "@/lib/map";
import { REGIONS, maskGeoJSON, regionBounds, regionsGeoJSON } from "@/data/regions";

// 3-level zoom explorer: Region → City → Gym. Default shows translucent region
// polygons; clicking a region zooms in and reveals its cities; clicking a city
// reveals individual gym pins; clicking a gym opens a detail popup. The sidebar
// (a bottom sheet on mobile) and breadcrumb stay in sync with the map level.
//
// MapLibre note: the basemap is raster (no font glyphs), so all labels are HTML
// markers, and region fills use a GeoJSON fill layer with feature-state hover.

const FIT = { padding: 70, duration: 650 } as const;
// Tighter framing for the country (region) view so Thailand fills the screen.
const FIT_COUNTRY = { padding: 24, duration: 650 } as const;

type Level = "region" | "city" | "gym";

const FIGHT_LABEL: Record<GymMapDatum["fight_access"], string> = {
  quick: "Fights easy to get",
  standard: "Fights after training",
  selective: "Experienced only",
  rare: "Not a fight gym",
};

function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

// Inline SVGs (Lucide paths) so the map popup — which is an HTML string, not
// React — uses the same icon set as the rest of the app.
const SVG_STAR =
  '<svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1.5" style="display:inline-block;vertical-align:-2px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
const SVG_SWORDS =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-1px"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/></svg>';

function gymPopupHTML(g: GymMapDatum): string {
  return `<div class="w-56">
    <div class="text-sm font-bold text-neutral-900">${esc(g.name)}</div>
    <div class="mt-0.5 inline-flex items-center gap-1 text-xs text-neutral-600">${SVG_STAR} ${g.rating.toFixed(1)} · ${g.price_range} · ${g.experience_level}${g.has_fighters ? " · resident fighters" : ""}</div>
    <div class="mt-1 flex items-center gap-1 text-xs font-medium text-amber-700">${SVG_SWORDS} ${FIGHT_LABEL[g.fight_access]}</div>
    <p class="mt-0.5 text-xs text-neutral-500">${esc(g.fight_note)}</p>
    <a href="/city/${g.citySlug}/${g.slug}" class="mt-2 inline-block rounded bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white">View full profile</a>
  </div>`;
}

export function MapExplorer({
  cities,
  gyms,
  regionCounts,
}: {
  cities: City[];
  gyms: GymMapDatum[];
  regionCounts: Record<string, number>;
}) {
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const level: Level = activeCity ? "gym" : activeRegion ? "city" : "region";
  // Mirror the current level into a ref so the map's (once-registered) click
  // handler can read it. Without this, clicking a city/gym marker also fires
  // the regions-fill map click (real mouse events propagate to the map),
  // which would reset activeCity → the badge appears to "do nothing".
  const levelRef = useRef<Level>(level);
  levelRef.current = level;
  const regionDef = REGIONS.find((r) => r.id === activeRegion);
  const cityObj = cities.find((c) => c.slug === activeCity);
  const citiesInRegion = useMemo(
    () => cities.filter((c) => c.region === activeRegion),
    [cities, activeRegion],
  );
  const gymsInCity = useMemo(
    () =>
      gyms
        .filter((g) => g.citySlug === activeCity)
        .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews),
    [gyms, activeCity],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const mlRef = useRef<typeof import("maplibre-gl") | null>(null);
  const regionMarkersRef = useRef<Marker[]>([]);
  const cityMarkersRef = useRef<Marker[]>([]);
  const gymMarkersRef = useRef<Marker[]>([]);
  const popupRef = useRef<Popup | null>(null);
  const syncRef = useRef<() => void>(() => {});

  // Navigation helpers (reset deeper levels).
  const goRegions = () => {
    setActiveRegion(null);
    setActiveCity(null);
    setSelectedGymId(null);
  };
  const goRegion = (id: Region) => {
    setActiveRegion(id);
    setActiveCity(null);
    setSelectedGymId(null);
  };
  const goCity = (slug: string) => {
    setActiveCity(slug);
    setSelectedGymId(null);
    setSheetExpanded(true);
  };

  // --- Create the map once, add region layers + interactions. ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cancelled = false;
    let ro: ResizeObserver | null = null;

    (async () => {
      const maplibregl = await import("maplibre-gl");
      if (cancelled || !el) return;
      mlRef.current = maplibregl;

      const map = new maplibregl.Map({
        container: el,
        style: BASEMAP_STYLE,
        center: [101.5, 13.2],
        zoom: 4,
        maxBounds: THAILAND_MAX_BOUNDS,
        minZoom: 4,
        maxZoom: 14,
        attributionControl: { compact: true },
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
      mapRef.current = map;
      ro = new ResizeObserver(() => map.resize());
      ro.observe(el);

      map.on("load", () => {
        // Spotlight mask: dim everything outside Thailand. Added FIRST so it
        // sits above the basemap tiles but below the region fills + labels.
        map.addSource("mask", { type: "geojson", data: maskGeoJSON() });
        map.addLayer({
          id: "mask-fill",
          type: "fill",
          source: "mask",
          paint: { "fill-color": "#ffffff", "fill-opacity": 0.5 },
        });

        map.addSource("regions", {
          type: "geojson",
          data: regionsGeoJSON(regionCounts),
          promoteId: "id",
        });
        map.addLayer({
          id: "regions-fill",
          type: "fill",
          source: "regions",
          paint: {
            "fill-color": ["get", "color"],
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "dimmed"], false], 0.05,
              ["boolean", ["feature-state", "hover"], false], 0.4,
              0.2,
            ],
          },
        });
        map.addLayer({
          id: "regions-line",
          type: "line",
          source: "regions",
          paint: {
            "line-width": 1.5,
            "line-color": ["get", "color"],
            "line-opacity": [
              "case",
              ["boolean", ["feature-state", "dimmed"], false], 0.12,
              0.6,
            ],
          },
        });

        let hovered: string | null = null;
        map.on("mousemove", "regions-fill", (e) => {
          map.getCanvas().style.cursor = "pointer";
          const id = e.features?.[0]?.id as string | undefined;
          if (id == null) return;
          if (hovered && hovered !== id) map.setFeatureState({ source: "regions", id: hovered }, { hover: false });
          hovered = id;
          map.setFeatureState({ source: "regions", id }, { hover: true });
        });
        map.on("mouseleave", "regions-fill", () => {
          map.getCanvas().style.cursor = "";
          if (hovered) map.setFeatureState({ source: "regions", id: hovered }, { hover: false });
          hovered = null;
        });
        map.on("click", "regions-fill", (e) => {
          // Only pick a region from the country-level view. Below that, the
          // city/gym markers own clicks; letting this fire would wipe the
          // selection a marker just made (see levelRef note above).
          if (levelRef.current !== "region") return;
          const id = e.features?.[0]?.properties?.id as Region | undefined;
          if (id) {
            setActiveRegion(id);
            setActiveCity(null);
            setSelectedGymId(null);
          }
        });

        map.resize();
        syncRef.current();
      });
    })();

    return () => {
      cancelled = true;
      ro?.disconnect();
      popupRef.current?.remove();
      [regionMarkersRef, cityMarkersRef, gymMarkersRef].forEach((r) => {
        r.current.forEach((m) => m.remove());
        r.current = [];
      });
      mapRef.current?.remove();
      mapRef.current = null;
      mlRef.current = null;
    };
  }, [regionCounts]);

  // --- React to level changes: markers, dim states, zoom. ---
  useEffect(() => {
    syncRef.current = () => {
      const map = mapRef.current;
      const ml = mlRef.current;
      if (!map || !ml || !map.getLayer("regions-fill")) return;

      // Dim non-active regions once you're below the region level.
      REGIONS.forEach((r) => {
        map.setFeatureState(
          { source: "regions", id: r.id },
          { dimmed: level !== "region" && r.id !== activeRegion },
        );
      });

      // Region labels — region level only.
      regionMarkersRef.current.forEach((m) => m.remove());
      regionMarkersRef.current = [];
      if (level === "region") {
        REGIONS.forEach((r) => {
          // Solid-fill pill: "Region · count", white text, hairline lift.
          // NOTE: no transform-based hover (MapLibre owns the element's
          // transform for positioning) — use a brightness hover instead.
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "cursor-pointer transition hover:brightness-110";
          btn.style.cssText = [
            "display:inline-flex",
            "align-items:center",
            "white-space:nowrap",
            `background:${r.pill}`,
            "color:#fff",
            "font-weight:500",
            "font-size:13.5px",
            "line-height:1",
            "padding:7px 14px",
            "border:none",
            "border-radius:999px",
            "box-shadow:0 1px 2px rgba(0,0,0,0.12)",
          ].join(";");

          const name = document.createElement("span");
          name.textContent = r.name;
          const sep = document.createElement("span");
          sep.textContent = "·";
          sep.style.cssText = "margin:0 6px;opacity:0.7";
          const count = document.createElement("span");
          count.textContent = String(regionCounts[r.id] ?? 0);
          count.style.cssText = "font-variant-numeric:tabular-nums;opacity:0.85";
          btn.append(name, sep, count);

          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            setActiveRegion(r.id);
            setActiveCity(null);
            setSelectedGymId(null);
          });
          regionMarkersRef.current.push(
            new ml.Marker({ element: btn }).setLngLat([r.label.lng, r.label.lat]).addTo(map),
          );
        });
      }

      // City badges — city level only.
      cityMarkersRef.current.forEach((m) => m.remove());
      cityMarkersRef.current = [];
      if (level === "city") {
        citiesInRegion.forEach((city) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className =
            "flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/95 px-3 py-1.5 text-sm font-semibold text-neutral-800 shadow-md ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-lg cursor-pointer";
          const n = document.createElement("span");
          n.textContent = city.name;
          const c = document.createElement("span");
          c.className = "rounded-full bg-amber-500 px-1.5 py-0.5 text-xs font-bold text-white";
          c.textContent = String(city.gym_count);
          btn.append(n, c);
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            goCity(city.slug);
          });
          cityMarkersRef.current.push(
            new ml.Marker({ element: btn }).setLngLat([city.center.lng, city.center.lat]).addTo(map),
          );
        });
      }

      // Gym pins — gym level only.
      gymMarkersRef.current.forEach((m) => m.remove());
      gymMarkersRef.current = [];
      if (level === "gym") {
        gymsInCity.forEach((g) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className =
            "max-w-[150px] truncate rounded-full border border-neutral-300 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-800 shadow ring-1 ring-black/5 transition hover:border-amber-400 hover:text-amber-700 cursor-pointer";
          btn.textContent = g.name;
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            setSelectedGymId(g.id);
          });
          gymMarkersRef.current.push(
            new ml.Marker({ element: btn }).setLngLat([g.lng, g.lat]).addTo(map),
          );
        });
      }

      // Zoom to the right extent.
      if (level === "region") {
        map.fitBounds(THAILAND_BOUNDS, FIT_COUNTRY);
      } else if (level === "city" && regionDef) {
        map.fitBounds(toLngLatBounds(regionBounds(regionDef)), FIT);
      } else if (level === "gym" && cityObj) {
        map.fitBounds(toLngLatBounds(cityObj.bounds), FIT);
      }
    };
    syncRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, activeRegion, activeCity, citiesInRegion, gymsInCity, regionCounts]);

  // --- Gym popup follows the selected gym. ---
  useEffect(() => {
    const map = mapRef.current;
    const ml = mlRef.current;
    popupRef.current?.remove();
    popupRef.current = null;
    if (!map || !ml || level !== "gym" || !selectedGymId) return;
    const g = gyms.find((x) => x.id === selectedGymId);
    if (!g) return;
    map.flyTo({ center: [g.lng, g.lat], zoom: Math.max(map.getZoom(), 12), duration: 500 });
    popupRef.current = new ml.Popup({ offset: 14, maxWidth: "260px" })
      .setLngLat([g.lng, g.lat])
      .setHTML(gymPopupHTML(g))
      .addTo(map);
  }, [selectedGymId, level, gyms]);

  return (
    <main className="relative h-[100dvh] min-h-[640px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <div ref={containerRef} className="h-full w-full" />
      </div>

      {/* Sidebar (desktop) / bottom sheet (mobile) */}
      <div
        className={`pointer-events-auto absolute inset-x-0 bottom-0 z-10 flex flex-col rounded-t-2xl bg-white/95 shadow-xl ring-1 ring-black/5 backdrop-blur md:inset-x-auto md:bottom-auto md:left-4 md:top-4 md:w-[360px] md:rounded-2xl ${
          sheetExpanded ? "max-h-[80dvh]" : "max-h-[44dvh]"
        } md:max-h-[calc(100dvh-2rem)]`}
      >
        {/* Mobile grab handle */}
        <button
          type="button"
          onClick={() => setSheetExpanded((v) => !v)}
          className="mx-auto mt-2 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-neutral-300 md:hidden"
          aria-label="Toggle panel"
        />

        <div className="overflow-y-auto px-5 pb-5 pt-2 md:pt-5">
          {/* Title (region level) */}
          {level === "region" && (
            <div className="mb-3">
              <h1 className="text-xl font-bold tracking-tight text-neutral-900">MuayThaiGuide</h1>
              <p className="text-sm text-neutral-600">
                Pick a region to explore Thailand&apos;s Muay Thai gyms.
              </p>
            </div>
          )}

          {/* Breadcrumb */}
          {level !== "region" && (
            <nav className="mb-3 flex flex-wrap items-center gap-1 text-sm">
              <button onClick={goRegions} className="font-medium text-amber-600 hover:text-amber-700">
                Thailand
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
              {level === "gym" && activeRegion ? (
                <>
                  <button
                    onClick={() => goRegion(activeRegion)}
                    className="font-medium text-amber-600 hover:text-amber-700"
                  >
                    {regionDef?.name}
                  </button>
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
                  <span className="font-semibold text-neutral-900">{cityObj?.name}</span>
                </>
              ) : (
                <span className="font-semibold text-neutral-900">{regionDef?.name}</span>
              )}
            </nav>
          )}

          {/* Level lists */}
          {level === "region" && (
            <ul className="space-y-1.5">
              {REGIONS.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => goRegion(r.id)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: r.color }} />
                      {r.name}
                    </span>
                    <span className="text-neutral-500">{regionCounts[r.id] ?? 0} gyms</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {level === "city" && (
            <ul className="space-y-1.5">
              {citiesInRegion.map((c) => (
                <li key={c.slug}>
                  <button
                    onClick={() => goCity(c.slug)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-amber-50"
                  >
                    <span>{c.name}</span>
                    <span className="text-neutral-500">{c.gym_count} gyms</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {level === "gym" && (
            <ol className="space-y-1.5">
              {gymsInCity.map((g, i) => (
                <li key={g.id}>
                  <button
                    onClick={() => setSelectedGymId(g.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left transition hover:border-amber-300 hover:bg-amber-50 ${
                      selectedGymId === g.id ? "border-amber-400 bg-amber-50" : "border-neutral-200"
                    }`}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold text-neutral-300">{i + 1}</span>
                      <span className="font-semibold text-neutral-900">{g.name}</span>
                      <span className="inline-flex items-center gap-0.5 text-xs text-neutral-500">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {g.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="mt-0.5 pl-5 text-xs text-neutral-500">
                      {g.price_range} · {g.experience_level}
                      {g.fight_access === "quick" && (
                        <span className="text-green-600"> · fights easy to get</span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </main>
  );
}
