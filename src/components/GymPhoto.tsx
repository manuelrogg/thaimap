// Single main (hero) photo for a gym profile.
// Priority: our own hosted image (editorial `heroImage`) -> first Google photo
// (M5) -> a gradient placeholder with the gym's initial (no external request).

const GRADIENTS = [
  "from-amber-200 to-orange-300",
  "from-rose-200 to-red-300",
  "from-sky-200 to-indigo-300",
  "from-emerald-200 to-teal-300",
];

export function GymPhoto({
  src,
  name,
}: {
  src?: string;
  name: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- hero image may be a remote Google URL; next/image config comes in M5.
      <img
        src={src}
        alt={name}
        className="aspect-[16/9] w-full rounded-xl object-cover"
        loading="lazy"
      />
    );
  }

  const initial = name.trim().charAt(0).toUpperCase() || "?";
  // Stable gradient per gym (hash the name) so it doesn't flicker between renders.
  const g = GRADIENTS[[...name].reduce((s, c) => s + c.charCodeAt(0), 0) % GRADIENTS.length];

  return (
    <div>
      <div
        className={`flex aspect-[16/9] w-full items-center justify-center rounded-xl bg-gradient-to-br ${g}`}
      >
        <span className="text-5xl font-black text-white/70">{initial}</span>
      </div>
      <p className="mt-1.5 text-xs text-neutral-400">Add a photo at /public/gyms/.</p>
    </div>
  );
}
