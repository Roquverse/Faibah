'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CompanyApi } from '@/lib/api';
import { type Tier, type Feature, TIER_FEATURES, tierCanAccess } from '@/lib/config/tiers';

interface TierContextValue {
  tier: Tier;
  loading: boolean;
  canAccess: (feature: string) => boolean;
}

const TierContext = createContext<TierContextValue>({
  tier: 'agency',     // default: agency shows everything — safe during transition
  loading: true,
  canAccess: () => true,
});

export function TierProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<Tier>('agency');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CompanyApi.getProfile()
      .then((profile) => {
        const planTier = profile?.planTier || profile?.plan_tier;
        if (planTier && planTier in TIER_FEATURES) {
          setTier(planTier as Tier);
        }
      })
      .catch(() => {/* keep default agency */})
      .finally(() => setLoading(false));
  }, []);

  const canAccess = (feature: string): boolean => {
    return tierCanAccess(tier, feature);
  };

  return (
    <TierContext.Provider value={{ tier, loading, canAccess }}>
      {children}
    </TierContext.Provider>
  );
}

export function useTier() {
  return useContext(TierContext);
}
