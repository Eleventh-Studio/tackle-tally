import { useCallback } from 'react';
import * as catchRepo from '@/db/repositories/catches';
import { useCatchStore } from '@/stores/useCatchStore';
import { generateId } from '@/utils/ids';
import { persistCatchPhoto, deleteCatchPhoto } from '@/utils/photoStorage';
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
      const id = generateId();
      // ImagePicker drops photos in the OS cache directory; iOS may evict them
      // under storage pressure. Copy into the app's documents dir before the DB
      // insert so the stored photo_uri is one we control.
      const persistentPhotoUri = persistCatchPhoto(id, input.photo_uri);
      const record: CreateCatchInput = {
        ...input,
        photo_uri: persistentPhotoUri,
        id,
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
      const existing = await catchRepo.getCatchById(id);
      await catchRepo.deleteCatch(id);
      removeCatch(id);
      if (existing?.photo_uri) deleteCatchPhoto(existing.photo_uri);
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
