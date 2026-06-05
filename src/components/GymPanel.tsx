"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

// Client shell for the intercepted gym profile (soft nav from the city view).
// Renders as a left-anchored panel on desktop so the map stays the hero to its
// right; full-screen on mobile. Closes via the X button, the Escape key, or
// clicking the dimmed area — all via router.back() so the URL/history stays
// correct (back closes, forward reopens).

export function GymPanel({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const close = () => router.back();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div className="fixed inset-0 z-40">
      {/* Dim/click-catcher. Transparent on desktop (map stays usable to the
          right of the panel); subtle scrim on mobile where the panel is full. */}
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 bg-black/30 md:bg-transparent md:pointer-events-none"
      />

      <div className="absolute inset-y-0 left-0 flex w-full flex-col bg-white shadow-2xl md:w-[440px]">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Gym profile
          </span>
          <button
            type="button"
            onClick={close}
            aria-label="Close profile"
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
