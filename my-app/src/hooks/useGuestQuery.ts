import { useState, useCallback } from 'react';

export const GUEST_LIMITS = { solve: 2, grade: 1, outline: 1 } as const;
export type GuestFeature = keyof typeof GUEST_LIMITS;

const STORAGE_KEY = 'dv_guest_queries';

function getUsage(): Record<GuestFeature, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      solve: typeof parsed.solve === 'number' ? parsed.solve : 0,
      grade: typeof parsed.grade === 'number' ? parsed.grade : 0,
      outline: typeof parsed.outline === 'number' ? parsed.outline : 0,
    };
  } catch {
    return { solve: 0, grade: 0, outline: 0 };
  }
}

/**
 * Track guest (unauthenticated) usage per feature against a free-tier limit.
 * Backed by localStorage so limits persist across page reloads.
 *
 * Usage:
 *   const { canQuery, consumeQuery, remaining } = useGuestQuery('solve');
 *   if (!token && !canQuery) { showAuthModal(); return; }
 *   await solveImage(file);
 *   if (!token) consumeQuery();
 */
export function useGuestQuery(feature: GuestFeature) {
  const [, forceRender] = useState(0);

  const usage = getUsage();
  const used = usage[feature];
  const limit = GUEST_LIMITS[feature];
  const remaining = Math.max(0, limit - used);
  const canQuery = remaining > 0;

  const consumeQuery = useCallback(() => {
    const current = getUsage();
    const next = { ...current, [feature]: current[feature] + 1 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    forceRender((n) => n + 1);
  }, [feature]);

  return { canQuery, consumeQuery, remaining, limit };
}
