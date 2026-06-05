// Gym ranking — a Bayesian/weighted "true rating" so that a gym with a 4.9
// average over 600 reviews outranks a 5.0 over 3 reviews.
//
//   score = (v / (v + m)) * R + (m / (v + m)) * C
//     R = this gym's rating
//     v = this gym's review count
//     m = confidence threshold (reviews needed before we trust R over the mean)
//     C = the global mean rating across all gyms
//
// This is the standard IMDb weighted-rating formula. Tune the two constants
// below to make ranking more or less forgiving of low review counts.

export const RANKING_CONFIG = {
  /** Reviews required before a gym's own rating dominates the prior. */
  confidenceThreshold: 50,
  /** Global mean rating (prior). Quality Thai gyms cluster high, so ~4.4. */
  globalMeanRating: 4.4,
} as const;

export type RankingConfig = typeof RANKING_CONFIG;

/**
 * Weighted score in the same 0–5 range as the raw rating.
 * Returns 0 when there is no rating data (so unranked gyms sink to the bottom).
 */
export function weightedScore(
  rating: number | null | undefined,
  reviewCount: number | null | undefined,
  config: RankingConfig = RANKING_CONFIG,
): number {
  const R = rating ?? 0;
  const v = reviewCount ?? 0;
  if (v <= 0 || R <= 0) return 0;

  const { confidenceThreshold: m, globalMeanRating: C } = config;
  return (v / (v + m)) * R + (m / (v + m)) * C;
}
