"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Frown } from "lucide-react";

// React Error Boundary for the intercepted gym panel — renders a friendly
// fallback inside the panel instead of blanking the page.
export default function GymPanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Gym panel failed to render:", error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Close"
        onClick={() => router.back()}
        className="absolute inset-0 bg-black/30 md:bg-transparent"
      />
      <div className="absolute inset-y-0 left-0 flex w-full flex-col items-center justify-center gap-3 bg-white p-8 text-center shadow-2xl md:w-[440px]">
        <Frown className="h-8 w-8 text-neutral-400" />
        <p className="text-lg font-semibold text-neutral-900">Could not load this gym</p>
        <p className="max-w-xs text-sm text-neutral-500">
          Something went wrong loading this profile.
        </p>
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
