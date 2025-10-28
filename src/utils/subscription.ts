export type SubscriptionTier = "free" | "premium";

export interface TierLimits {
  maxRecommendationsPerDay: number;
  maxFavorites: number;
  historyDays: number;
  recipesPerRecommendation: number;
  canAccessPlanner: boolean;
  canAccessStats: boolean;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    maxRecommendationsPerDay: 3,
    maxFavorites: 10,
    historyDays: 7,
    recipesPerRecommendation: 1,
    canAccessPlanner: false,
    canAccessStats: true,
  },
  premium: {
    maxRecommendationsPerDay: 999,
    maxFavorites: 999,
    historyDays: 365,
    recipesPerRecommendation: 3,
    canAccessPlanner: true,
    canAccessStats: true,
  },
};

export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return TIER_LIMITS[tier];
}

export function canAccessFeature(tier: SubscriptionTier, feature: keyof TierLimits): boolean {
  const limits = getTierLimits(tier);
  const value = limits[feature];

  if (typeof value === "boolean") {
    return value;
  }

  return true;
}
