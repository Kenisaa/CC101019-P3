import { db } from "../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type SubscriptionTier = "free" | "premium";

export interface UserSubscription {
  tier: SubscriptionTier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
}

export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const docRef = doc(db, "users", userId, "subscription", "current");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserSubscription;
  }

  return { tier: "free" };
}

export async function updateUserSubscription(
  userId: string,
  subscription: UserSubscription
): Promise<void> {
  const docRef = doc(db, "users", userId, "subscription", "current");
  await setDoc(docRef, subscription);
}

export const SUBSCRIPTION_LIMITS = {
  free: {
    recommendationsPerDay: 3,
    recipesPerRecommendation: 1,
    mealHistoryDays: 7,
  },
  premium: {
    recommendationsPerDay: -1, // unlimited
    recipesPerRecommendation: 3,
    mealHistoryDays: 365,
  },
};
