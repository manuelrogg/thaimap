import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCities, getCityBySlug, getGymsByCity } from "@/lib/data";
import { CityView } from "@/components/CityView";

// City view (M3): split map + ranked list with two-way hover sync, mobile
// toggle. The page is a thin server wrapper; interactivity lives in CityView.
//
// Next.js 16: `params` is async (a Promise) — must be awaited.

type Params = { slug: string };

// ToS: Google data may only be cached short-term. ISR revalidates the rendered
// page every 6h so live ratings/photos never persist longer than that. In seed
// mode this just regenerates identical content — harmless. (Matches the Places
// client cache TTL in lib/places.ts.)
export const revalidate = 21600; // 6 hours

/** Pre-render all city pages at build time. */
export function generateStaticParams(): Params[] {
  return getCities().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return { title: "City not found" };
  const title = `Muay Thai gyms in ${city.name}`;
  const description = `Ranked guide to the ${city.gym_count} Muay Thai gyms in ${city.name}, Thailand. ${city.blurb}`;
  return {
    title,
    description,
    alternates: { canonical: `/city/${city.slug}` },
    openGraph: { title, description, type: "website" },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  const gyms = await getGymsByCity(slug);
  return <CityView city={city} gyms={gyms} />;
}
