"use client";

import type { ExperienceLevel, KnownForTag, PriceRange } from "@/lib/types";
import { KNOWN_FOR_TAGS } from "@/lib/types";
import type { GymFilters } from "@/lib/filters";
import { isActive } from "@/lib/filters";

// City-view search + filter bar. Fully controlled; the parent owns state and
// URL syncing. Compact enough to sit above the ranked list on desktop and
// mobile alike.

type Props = {
  value: GymFilters;
  onChange: (next: GymFilters) => void;
  resultCount: number;
  total: number;
};

const LEVELS: { v: ExperienceLevel; label: string }[] = [
  { v: "beginner", label: "Beginner" },
  { v: "mixed", label: "All levels" },
  { v: "advanced", label: "Advanced" },
];
const PRICES: PriceRange[] = ["$", "$$", "$$$"];

export function CityFilters({ value, onChange, resultCount, total }: Props) {
  const set = (patch: Partial<GymFilters>) => onChange({ ...value, ...patch });

  const toggleTag = (t: KnownForTag) =>
    set({
      tags: value.tags.includes(t)
        ? value.tags.filter((x) => x !== t)
        : [...value.tags, t],
    });

  return (
    <div className="space-y-2.5 border-b border-neutral-200 bg-white p-3">
      <input
        type="search"
        value={value.q}
        onChange={(e) => set({ q: e.target.value })}
        placeholder="Search gyms…"
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
      />

      <div className="flex flex-wrap gap-1.5">
        <select
          value={value.level ?? ""}
          onChange={(e) =>
            set({ level: (e.target.value || null) as ExperienceLevel | null })
          }
          className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
          aria-label="Experience level"
        >
          <option value="">Any level</option>
          {LEVELS.map((l) => (
            <option key={l.v} value={l.v}>
              {l.label}
            </option>
          ))}
        </select>

        <select
          value={value.price ?? ""}
          onChange={(e) =>
            set({ price: (e.target.value || null) as PriceRange | null })
          }
          className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
          aria-label="Price"
        >
          <option value="">Any price</option>
          {PRICES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => set({ accommodation: !value.accommodation })}
          aria-pressed={value.accommodation}
          className={`rounded-lg border px-2.5 py-1.5 text-sm font-medium transition ${
            value.accommodation
              ? "border-amber-400 bg-amber-50 text-amber-800"
              : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
          }`}
        >
          Stays on-site
        </button>
      </div>

      <div className="flex flex-wrap gap-1">
        {KNOWN_FOR_TAGS.map((t) => {
          const on = value.tags.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggleTag(t)}
              aria-pressed={on}
              className={`rounded-full px-2 py-0.5 text-xs transition ${
                on
                  ? "bg-amber-500 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>
          {resultCount} of {total} gyms
        </span>
        {isActive(value) && (
          <button
            type="button"
            onClick={() => onChange({ q: "", level: null, price: null, accommodation: false, tags: [] })}
            className="font-medium text-amber-600 hover:text-amber-700"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
