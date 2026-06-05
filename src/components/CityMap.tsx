"use client";

import { useEffect, useRef } from "react";
import type { Map as MlMap, Marker } from "maplibre-gl";
import type { City, Gym } from "@/lib/types";
import { BASEMAP_STYLE, CITY_ZOOM, padBounds, toLngLatBounds } from "@/lib/map";

// M3 — the city map. Plots one pin per gym, fit to the city's bounds, and stays
// in sync with the side list via `hoveredId` / `selectedId` (controlled by the
// parent CityView). Hovering or clicking a pin reports back up.
//
// Marker DOM is a wrapper (positioned by MapLibre) containing an inner pin that
// WE restyle for highlight — so our scale transform never fights MapLibre's
// translate transform on the wrapper.

const PIN_BASE =
  "flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-md cursor-pointer transition-transform duration-150";
const PIN_IDLE = "bg-neutral-700";
const PIN_ACTIVE = "bg-blue-500 scale-[1.35]";

function pinClass(active: boolean) {
  return `${PIN_BASE} ${active ? PIN_ACTIVE : PIN_IDLE}`;
}

type Props = {
  city: City;
  gyms: Gym[]; // pre-sorted by rank
  hoveredId: string | null;
  selectedId: string | null;
  /** Optional so a server-rendered page can mount the map with no callbacks. */
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  /** False while hidden behind the mobile list toggle; triggers a resize+refit. */
  active?: boolean;
  /** When set, only these gym pins are shown (filtering). null = show all. */
  visibleIds?: Set<string> | null;
};

export function CityMap({
  city,
  gyms,
  hoveredId,
  selectedId,
  onHover,
  onSelect,
  active = true,
  visibleIds = null,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const pinsRef = useRef<Record<string, HTMLElement>>({});
  // Keep latest callbacks without re-running the map-init effect.
  const onHoverRef = useRef(onHover);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onHoverRef.current = onHover;
    onSelectRef.current = onSelect;
  });

  // Init map + markers (once per city/gym set).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let map: MlMap | null = null;
    let markers: Marker[] = [];
    let ro: ResizeObserver | null = null;
    let cancelled = false;
    pinsRef.current = {};

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !el) return;

      // Explicit valid camera up front (city center) so tiles load even if the
      // container is 0×0 at creation; fit to precise bounds on load. Passing
      // `bounds` here would compute an invalid zoom at 0×0 and never load tiles.
      map = new maplibregl.Map({
        container: el,
        style: BASEMAP_STYLE,
        center: [city.center.lng, city.center.lat],
        zoom: 11,
        // Keep the view on this city: limit panning + zoom (perf + focus).
        maxBounds: padBounds(city.bounds, 0.6),
        minZoom: CITY_ZOOM.min,
        maxZoom: CITY_ZOOM.max,
        attributionControl: { compact: true },
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
      mapRef.current = map;

      // Recover from 0×0 creation or later layout changes.
      ro = new ResizeObserver(() => map?.resize());
      ro.observe(el);
      map.once("load", () => {
        map?.resize();
        map?.fitBounds(toLngLatBounds(city.bounds), { padding: 48, duration: 0 });
      });

      markers = gyms
        .filter((g) => g.google)
        .map((gym, i) => {
          const wrap = document.createElement("div");
          const pin = document.createElement("button");
          pin.type = "button";
          pin.className = pinClass(false);
          pin.textContent = String(i + 1);
          pin.setAttribute("aria-label", gym.name);
          pin.addEventListener("mouseenter", () => onHoverRef.current?.(gym.id));
          pin.addEventListener("mouseleave", () => onHoverRef.current?.(null));
          pin.addEventListener("click", () => onSelectRef.current?.(gym.id));
          wrap.appendChild(pin);
          pinsRef.current[gym.id] = pin;

          return new maplibregl.Marker({ element: wrap })
            .setLngLat([gym.google!.lng, gym.google!.lat])
            .addTo(map!);
        });
    })();

    return () => {
      cancelled = true;
      ro?.disconnect();
      markers.forEach((m) => m.remove());
      map?.remove();
      mapRef.current = null;
      pinsRef.current = {};
    };
  }, [city, gyms]);

  // Reflect hover/selection into pin styles.
  useEffect(() => {
    const activeId = hoveredId ?? selectedId;
    for (const [id, pin] of Object.entries(pinsRef.current)) {
      pin.className = pinClass(id === activeId);
    }
  }, [hoveredId, selectedId]);

  // Show/hide pins per the active filter set (no re-fit, no remount).
  useEffect(() => {
    for (const [id, pin] of Object.entries(pinsRef.current)) {
      const wrap = pin.parentElement;
      if (wrap) {
        wrap.style.display = !visibleIds || visibleIds.has(id) ? "" : "none";
      }
    }
  }, [visibleIds]);

  // When revealed (mobile toggle), the map was sized 0×0 while hidden — fix it.
  useEffect(() => {
    if (!active) return;
    const map = mapRef.current;
    if (!map) return;
    map.resize();
    map.fitBounds(toLngLatBounds(city.bounds), { padding: 48 });
  }, [active, city]);

  // Pan to the selected gym.
  useEffect(() => {
    if (!selectedId) return;
    const gym = gyms.find((g) => g.id === selectedId);
    if (gym?.google && mapRef.current) {
      mapRef.current.panTo([gym.google.lng, gym.google.lat], { duration: 500 });
    }
  }, [selectedId, gyms]);

  return <div ref={containerRef} className="h-full w-full" />;
}
