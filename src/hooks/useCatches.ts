import { useCallback } from 'react';
import * as catchRepo from '@/db/repositories/catches';
import { useCatchStore } from '@/stores/useCatchStore';
import { generateId } from '@/utils/ids';
import type { Catch, CreateCatchInput } from '@/types';

/**
 * Data hook for catches — bridges the DB layer and the Zustand store.
 * Screens import this hook, not the DB repositories directly.
 */
export function useCatches() {
  const { catches, isLoading, setCatches, addCatch, removeCatch, updateCatch, setLoading } =
    useCatchStore();

  const loadCatches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await catchRepo.getAllCatches();
      setCatches(data);
    } finally {
      setLoading(false);
    }
  }, [setCatches, setLoading]);

  const createCatch = useCallback(
    async (input: Omit<CreateCatchInput, 'id' | 'created_at'>): Promise<Catch> => {
      const record: CreateCatchInput = {
        ...input,
        id: generateId(),
        created_at: new Date().toISOString(),
      };
      const created = await catchRepo.createCatch(record);
      addCatch(created);
      return created;
    },
    [addCatch]
  );

  const deleteCatch = useCallback(
    async (id: string) => {
      await catchRepo.deleteCatch(id);
      removeCatch(id);
    },
    [removeCatch]
  );

  const editCatch = useCallback(
    async (id: string, data: Partial<Catch>) => {
      await catchRepo.updateCatch(id, data);
      updateCatch(id, data);
    },
    [updateCatch]
  );

  return { catches, isLoading, loadCatches, createCatch, deleteCatch, editCatch };
}
