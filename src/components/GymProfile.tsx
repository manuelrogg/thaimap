import { AtSign, ExternalLink, MapPin, Star, Swords, Trophy } from "lucide-react";
import type { City, FightAccess, Gym } from "@/lib/types";
import { GymPhoto } from "@/components/GymPhoto";

const FIGHT_ACCESS_META: Record<FightAccess, { label: string; cls: string }> = {
  quick: { label: "Fights easy to get", cls: "bg-green-50 text-green-800 ring-green-200" },
  standard: { label: "Fights after some training", cls: "bg-blue-50 text-blue-800 ring-blue-200" },
  selective: { label: "Experienced fighters only", cls: "bg-orange-50 text-orange-800 ring-orange-200" },
  rare: { label: "Not really a fight gym", cls: "bg-neutral-100 text-neutral-600 ring-neutral-200" },
};

const EXPERIENCE_LABEL: Record<Gym["experience_level"], string> = {
  beginner: "Beginner-friendly",
  mixed: "All levels",
  advanced: "Advanced / fighters",
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-neutral-50 px-3 py-2">
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-neutral-900">{value}</dd>
    </div>
  );
}

export function GymProfile({ gym, city }: { gym: Gym; city: City }) {
  const g = gym.google;
  const fight = FIGHT_ACCESS_META[gym.fight_access] ?? FIGHT_ACCESS_META.standard;
  const level = EXPERIENCE_LABEL[gym.experience_level] ?? gym.experience_level ?? "—";

  const hasContact = gym.instagram || gym.line_id || g?.website || g?.phone;

  return (
    <article className="space-y-6">
      {/* Unverified warning — prominent, at the top */}
      {!gym.verified && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          <span className="font-semibold">Unverified listing</span> — details are
          community-sourced and may be outdated. Confirm directly before booking.
        </div>
      )}

      <GymPhoto src={gym.heroImage ?? g?.photos?.[0]?.ref} name={gym.name} />

      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
          {city.name} · {city.region}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
          {gym.name}
        </h1>
        {g && (
          <p className="mt-1 inline-flex items-center gap-1 text-sm text-neutral-600">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-neutral-900">
              {g.google_rating.toFixed(1)}
            </span>
            · {g.google_review_count.toLocaleString()} Google reviews
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(gym.known_for ?? []).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      <p className="text-sm leading-relaxed text-neutral-700">{gym.description}</p>

      {/* Fight access — most important info for a fighter */}
      <div className={`rounded-lg p-3 ring-1 ${fight.cls}`}>
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
          <Swords className="h-4 w-4" />
          Fighting as a foreigner — {fight.label}
        </div>
        {gym.fight_note && <p className="mt-1 text-sm">{gym.fight_note}</p>}
      </div>

      {/* Stadiums — where fighters actually compete */}
      {gym.stadiums?.length ? (
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
            <Trophy className="h-4 w-4 text-amber-500" />
            Fights at
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {gym.stadiums.map((s) => (
              <span
                key={s}
                className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <dl className="grid grid-cols-2 gap-2">
        <Fact label="Level" value={level} />
        <Fact label="Resident fighters" value={gym.has_fighters ? "Yes" : "No"} />
        <Fact label="Price" value={`${gym.price_range ?? "—"}${gym.price_note ? ` · ${gym.price_note}` : ""}`} />
        <Fact label="On-site stay" value={gym.has_accommodation ? "Yes" : "No"} />
        {gym.style && <Fact label="Tradition / style" value={gym.style} />}
      </dl>

      {gym.trainers?.length ? (
        <section>
          <h2 className="text-sm font-semibold text-neutral-900">Trainers</h2>
          <ul className="mt-2 space-y-1.5">
            {gym.trainers.map((t, i) => (
              <li key={i} className="text-sm text-neutral-700">
                <span className="font-medium">{t.name}</span>
                {t.note && <span className="text-neutral-500"> — {t.note}</span>}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Contact — fighters need to reach out before arriving */}
      {hasContact && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-neutral-900">Contact</h2>
          {gym.instagram && (
            <a
              href={`https://instagram.com/${gym.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900"
            >
              <AtSign className="h-4 w-4 text-pink-500" />
              @{gym.instagram}
            </a>
          )}
          {gym.line_id && (
            <p className="text-sm text-neutral-700">
              <span className="font-medium">LINE:</span> {gym.line_id}
            </p>
          )}
          {g?.website && (
            <a
              href={g.website}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-blue-700 hover:underline"
            >
              {g.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          {g?.phone && (
            <a href={`tel:${g.phone}`} className="block text-sm text-neutral-700">
              {g.phone}
            </a>
          )}
          {g?.hours_weekday_text?.length ? (
            <ul className="text-xs text-neutral-500">
              {g.hours_weekday_text.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          ) : null}
        </section>
      )}

      {g && (
        <a
          href={g.google_maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700"
        >
          <MapPin className="h-4 w-4" />
          View on Google Maps
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </article>
  );
}
