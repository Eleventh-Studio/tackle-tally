import { create } from 'zustand';
import type { Catch } from '@/types';

interface CatchStore {
  catches: Catch[];
  isLoading: boolean;
  setCatches: (catches: Catch[]) => void;
  addCatch: (c: Catch) => void;
  removeCatch: (id: string) => void;
  updateCatch: (id: string, data: Partial<Catch>) => void;
  setLoading: (loading: boolean) => void;
}

export const useCatchStore = create<CatchStore>((set) => ({
  catches: [],
  isLoading: false,
  setCatches: (catches) => set({ catches }),
  addCatch: (c) => set((state) => ({ catches: [c, ...state.catches] })),
  removeCatch: (id) =>
    set((state) => ({ catches: state.catches.filter((c) => c.id !== id) })),
  updateCatch: (id, data) =>
    set((state) => ({
      catches: state.catches.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
