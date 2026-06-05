// Loading skeleton for the city view (shown during dynamic renders, e.g. when
// live Google data is enabled). Mirrors the list-left / map-right layout.
export default function CityLoading() {
  return (
    <div className="flex h-[100dvh] min-h-[640px] flex-col">
      <div className="h-[57px] border-b border-neutral-200 bg-white" />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-full flex-col gap-3 bg-neutral-50 p-3 md:flex md:w-[380px] md:border-r md:border-neutral-200">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg border border-neutral-200 bg-white"
            />
          ))}
        </aside>
        <div className="flex-1 animate-pulse bg-neutral-200" />
      </div>
    </div>
  );
}
