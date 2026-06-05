"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { City, Gym } from "@/lib/types";
import {
  type GymFilters,
  EMPTY_FILTERS,
  applyFilters,
  filtersToQuery,
  isActive,
  parseFiltersFromSearch,
} from "@/lib/filters";
import { GymListItem } from "@/components/GymListItem";
import { CityFilters } from "@/components/CityFilters";
import { CityMap } from "@/components/CityMap";

// M3 + M6 — interactive city view. Owns hover/selection state (two-way sync
// between list and map) AND the search/filter state. Filters narrow both the
// list and the visible map pins, and write to the URL so the view is shareable.
// On mobile the list and map stack behind a List/Map toggle (map = hero on
// desktop).

type Hover = { id: string; source: "list" | "map" } | null;

export function CityView({ city, gyms }: { city: City; gyms: Gym[] }) {
  const router = useRouter();
  const [filters, setFilters] = useState<GymFilters>(EMPTY_FILTERS);
  const [hover, setHover] = useState<Hover>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});
  // Start false so the first client render matches the (unfiltered) SSR HTML —
  // avoids a hydration mismatch — then we apply URL filters in an effect.
  const didInit = useRef(false);

  const hoveredId = hover?.id ?? null;

  const visibleGyms = useMemo(() => applyFilters(gyms, filters), [gyms, filters]);
  const visibleIds = useMemo(
    () => new Set(visibleGyms.map((g) => g.id)),
    [visibleGyms],
  );

  // Initialize filters from the URL once, after mount. Deliberately a one-time
  // post-hydration sync from an external source (the URL) — starting empty keeps
  // the first client render matching SSR, so this is not a cascading-render bug.
  useEffect(() => {
    const f = parseFiltersFromSearch(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time URL hydration
    if (isActive(f)) setFilters(f);
    didInit.current = true;
  }, []);

  // Sync filters to the URL without a full Next navigation (which would remount
  // the map). Skipped until after the initial URL read so we don't clobber it.
  useEffect(() => {
    if (!didInit.current) return;
    const qs = filtersToQuery(filters);
    const url = `/city/${city.slug}${qs ? `?${qs}` : ""}`;
    window.history.replaceState(window.history.state, "", url);
  }, [filters, city.slug]);

  // Scroll a list item into view when its hover originates on the map.
  useEffect(() => {
    if (hover?.source !== "map") return;
    itemRefs.current[hover.id]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [hover]);

  const openGym = (gym: Gym) => {
    setSelectedId(gym.id);
    router.push(`/city/${city.slug}/${gym.slug}`);
  };

  return (
    <div className="flex h-[100dvh] min-h-[640px] flex-col">
      <header className="z-20 flex items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3">
        <div className="min-w-0">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            All of Thailand
          </Link>
          <h1 className="truncate text-lg font-bold tracking-tight text-neutral-900">
            Muay Thai in {city.name}{" "}
            <span className="text-sm font-normal text-neutral-500">
              · {city.gym_count} gyms
            </span>
          </h1>
        </div>

        <div className="flex shrink-0 rounded-lg border border-neutral-200 p-0.5 text-sm md:hidden">
          {(["list", "map"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setMobileView(v)}
              className={`rounded-md px-3 py-1 font-medium capitalize transition ${
                mobileView === v
                  ? "bg-blue-500 text-white"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`${
            mobileView === "list" ? "flex" : "hidden"
          } w-full flex-col overflow-hidden bg-neutral-50 md:flex md:w-[380px] md:shrink-0 md:border-r md:border-neutral-200`}
        >
          <CityFilters
            value={filters}
            onChange={setFilters}
            resultCount={visibleGyms.length}
            total={gyms.length}
          />

          <div className="flex-1 overflow-y-auto">
            {visibleGyms.length === 0 ? (
              <div className="p-8 text-center text-sm text-neutral-500">
                <p className="font-medium text-neutral-700">No gyms match these filters.</p>
                <button
                  type="button"
                  onClick={() =>
                    setFilters({ q: "", level: null, price: null, accommodation: false, tags: [] })
                  }
                  className="mt-2 font-medium text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <ol className="space-y-2 p-3">
                {visibleGyms.map((gym, i) => {
                  const active = hoveredId === gym.id || selectedId === gym.id;
                  return (
                    <li
                      key={gym.id}
                      ref={(el) => {
                        itemRefs.current[gym.id] = el;
                      }}
                      onMouseEnter={() => setHover({ id: gym.id, source: "list" })}
                      onMouseLeave={() => setHover(null)}
                    >
                      <Link
                        href={`/city/${city.slug}/${gym.slug}`}
                        onClick={() => setSelectedId(gym.id)}
                        className={`block w-full rounded-lg text-left transition ${
                          active ? "ring-2 ring-amber-400" : "ring-0"
                        }`}
                      >
                        <GymListItem gym={gym} rank={i + 1} />
                      </Link>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </aside>

        <div
          className={`${
            mobileView === "map" ? "block" : "hidden"
          } relative flex-1 md:block`}
        >
          <CityMap
            city={city}
            gyms={gyms}
            visibleIds={visibleIds}
            hoveredId={hoveredId}
            selectedId={selectedId}
            onHover={(id) => setHover(id ? { id, source: "map" } : null)}
            onSelect={(id) => {
              const gym = gyms.find((x) => x.id === id);
              if (gym) openGym(gym);
            }}
            active={mobileView === "map"}
          />
        </div>
      </div>
    </div>
  );
}
