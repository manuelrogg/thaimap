"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Frown } from "lucide-react";

// React Error Boundary for the canonical gym page — shows a friendly message
// instead of a blank white screen if the profile fails to render.
export default function GymError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Gym profile failed to render:", error);
  }, [error]);

  return (
    <div className="flex h-[100dvh] min-h-[640px] flex-col items-center justify-center gap-3 p-8 text-center">
      <Frown className="h-8 w-8 text-neutral-400" />
      <p className="text-lg font-semibold text-neutral-900">Could not load this gym</p>
      <p className="max-w-sm text-sm text-neutral-500">
        Something went wrong loading this profile. The rest of the guide is fine.
      </p>
      <div className="mt-1 flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
        >
          Back to map
        </Link>
      </div>
    </div>
  );
}
