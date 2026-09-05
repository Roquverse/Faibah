'use client';

import { useTier } from '@/context/TierContext';
import type { Feature } from '@/lib/config/tiers';
import { getUpgradeRequired } from '@/lib/config/tiers';

/**
 * useTierAccess — use this anywhere in the UI to gate features.
 *
 * @example
 * const { canAccess, tier, upgradeRequiredFor } = useTierAccess();
 * if (!canAccess('tasks')) return null;
 */
export function useTierAccess() {
  const { tier, canAccess, loading } = useTier();

  return {
    tier,
    loading,
    canAccess,
    /** Returns the minimum tier required, or null if current tier has access */
    upgradeRequiredFor: (feature: string) => {
      if (canAccess(feature)) return null;
      return getUpgradeRequired(feature);
    },
  };
}
