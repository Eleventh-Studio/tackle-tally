import { useMemo } from 'react';
import { useCatchStore } from '@/stores/useCatchStore';
import { useSessionStore } from '@/stores/useSessionStore';
import type { Catch } from '@/types';

interface AppStats {
  totalCatches: number;
  totalSessions: number;
  uniqueSpecies: number;
  biggestCatch: Catch | null;
  topSpecies: string | null;
  speciesBreakdown: { species: string; count: number }[];
}

export function useStats(): AppStats {
  const catches = useCatchStore((s) => s.catches);
  const sessions = useSessionStore((s) => s.sessions);

  return useMemo(() => {
    const totalCatches = catches.length;
    const totalSessions = sessions.length;

    const speciesMap = new Map<string, number>();
    let biggestCatch: Catch | null = null;

    for (const c of catches) {
      // Catches with null species are "Needs ID" entries — exclude from the
      // species breakdown until the user identifies them.
      if (c.species) {
        speciesMap.set(c.species, (speciesMap.get(c.species) ?? 0) + 1);
      }
      if (!biggestCatch || (c.length_cm ?? 0) > (biggestCatch.length_cm ?? 0)) {
        biggestCatch = c;
      }
    }

    const speciesBreakdown = Array.from(speciesMap.entries())
      .map(([species, count]) => ({ species, count }))
      .sort((a, b) => b.count - a.count);

    const uniqueSpecies = speciesBreakdown.length;
    const topSpecies = speciesBreakdown[0]?.species ?? null;

    return { totalCatches, totalSessions, uniqueSpecies, biggestCatch, topSpecies, speciesBreakdown };
  }, [catches, sessions]);
}
