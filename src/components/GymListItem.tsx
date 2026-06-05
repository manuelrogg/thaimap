import { Star } from "lucide-react";
import type { Gym } from "@/lib/types";

// Presentational ranked-list item (the overview card). Shows the gym's photo
// thumbnail, rank, rating, a one-line "what makes it distinct" summary and tags.
// Kept dumb + server-renderable; CityView wraps it for hover/link behaviour.

const GRADIENTS = [
  "from-blue-200 to-orange-300",
  "from-rose-200 to-red-300",
  "from-sky-200 to-indigo-300",
  "from-emerald-200 to-teal-300",
];

function Thumb({ gym }: { gym: Gym }) {
  const src = gym.heroImage ?? gym.google?.photos?.[0]?.ref;
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- may be a remote Google URL; next/image config comes in M5.
      <img
        src={src}
        alt={gym.name}
        className="h-14 w-20 shrink-0 rounded-md object-cover"
        loading="lazy"
      />
    );
  }
  const initial = gym.name.trim().charAt(0).toUpperCase() || "?";
  const grad = GRADIENTS[[...gym.name].reduce((s, c) => s + c.charCodeAt(0), 0) % GRADIENTS.length];
  return (
    <div
      className={`flex h-14 w-20 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${grad}`}
    >
      <span className="text-lg font-black text-white/70">{initial}</span>
    </div>
  );
}

export function GymListItem({ gym, rank }: { gym: Gym; rank: number }) {
  return (
    <article className="flex gap-3 rounded-lg border border-neutral-200 bg-white p-3">
      <div className="w-5 shrink-0 pt-0.5 text-base font-bold text-neutral-300">
        {rank}
      </div>
      <Thumb gym={gym} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2.5">
          <h3 className="font-semibold text-neutral-900">{gym.name}</h3>
          {gym.google && (
            <span className="inline-flex items-center gap-1 text-sm text-neutral-600">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {gym.google.google_rating.toFixed(1)}
              <span className="text-neutral-400">
                ({gym.google.google_review_count})
              </span>
            </span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-neutral-400">
          <span>
            {gym.price_range} · {gym.experience_level}
          </span>
          {gym.fight_access === "quick" && (
            <span className="text-green-600">· fights easy to get</span>
          )}
          {gym.has_fighters && <span className="text-blue-600">· resident fighters</span>}
          {gym.has_accommodation && <span>· stays on-site</span>}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
          {gym.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {gym.known_for.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
