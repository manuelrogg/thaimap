import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCityBySlug, getGym, getGymIndex, getGymsByCity } from "@/lib/data";
import { GymProfile } from "@/components/GymProfile";
import { CityMap } from "@/components/CityMap";

// Canonical gym page — rendered on hard navigation / direct link / by crawlers
// (the intercepted panel handles soft nav from the city view). Map stays a
// hero: profile on the left, the city map with this gym selected on the right.
//
// Next.js 16: params is async.

type Params = { slug: string; gymSlug: string };

// ToS: Google data may only be cached short-term. ISR revalidates the rendered
// page every 6h so live ratings/photos never persist longer than that. In seed
// mode this just regenerates identical content — harmless. (Matches the Places
// client cache TTL in lib/places.ts.)
export const revalidate = 21600; // 6 hours

/** Pre-render every gym page at build time (editorial index — no Google calls). */
export function generateStaticParams(): Params[] {
  return getGymIndex().map((g) => ({ slug: g.citySlug, gymSlug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug, gymSlug } = await params;
  const gym = await getGym(slug, gymSlug);
  const city = getCityBySlug(slug);
  if (!gym || !city) return { title: "Gym not found" };

  const title = `${gym.name} — Muay Thai in ${city.name}`;
  const description = gym.description;
  return {
    title,
    description,
    alternates: { canonical: `/city/${city.slug}/${gym.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
    },
  };
}

export default async function GymCanonicalPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug, gymSlug } = await params;
  const city = getCityBySlug(slug);
  const gym = await getGym(slug, gymSlug);
  if (!city || !gym) notFound();

  const gyms = await getGymsByCity(slug);

  return (
    <div className="flex h-[100dvh] min-h-[640px] flex-col md:flex-row">
      {/* Profile — left column */}
      <div className="flex w-full flex-col overflow-y-auto md:w-[440px] md:shrink-0 md:border-r md:border-neutral-200">
        <div className="border-b border-neutral-200 px-5 py-3">
          <Link
            href={`/city/${city.slug}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to {city.name}
          </Link>
        </div>
        <div className="p-5">
          <GymProfile gym={gym} city={city} />
        </div>
      </div>

      {/* Map — right, this gym selected */}
      <div className="relative min-h-[40vh] flex-1">
        <CityMap city={city} gyms={gyms} hoveredId={null} selectedId={gym.id} />
      </div>
    </div>
  );
}
