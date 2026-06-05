import { notFound } from "next/navigation";
import { getCityBySlug, getGym } from "@/lib/data";
import { GymPanel } from "@/components/GymPanel";
import { GymProfile } from "@/components/GymProfile";

// Intercepted route: when a gym is opened via soft navigation from the city
// view, render its profile inside the overlay panel (the city map stays mounted
// behind it). Hard navigation / refresh falls through to the canonical page at
// app/city/[slug]/[gymSlug]/page.tsx instead.
//
// Next.js 16: params is async.

type Params = { slug: string; gymSlug: string };

export default async function InterceptedGym({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug, gymSlug } = await params;
  const city = getCityBySlug(slug);
  const gym = await getGym(slug, gymSlug);
  if (!city || !gym) notFound();

  return (
    <GymPanel>
      <GymProfile gym={gym} city={city} />
    </GymPanel>
  );
}
