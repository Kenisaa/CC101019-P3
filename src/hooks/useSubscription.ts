import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { getUserSubscription, type UserSubscription } from "../services/subscription";

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription>({ tier: "free" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription({ tier: "free" });
      setLoading(false);
      return;
    }

    getUserSubscription(user.uid)
      .then(setSubscription)
      .finally(() => setLoading(false));
  }, [user]);

  return {
    subscription,
    loading,
    isPremium: subscription.tier === "premium",
  };
}
