import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LengthUnit = 'cm' | 'in';
export type WeightUnit = 'kg' | 'lb';

interface SettingsStore {
  lengthUnit: LengthUnit;
  weightUnit: WeightUnit;
  setLengthUnit: (u: LengthUnit) => void;
  setWeightUnit: (u: WeightUnit) => void;
}

// Catch data is always stored in metric internally (length in cm, weight in g);
// these settings only affect how values are displayed and how user input is
// interpreted before being normalised back to metric on save.
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      lengthUnit: 'cm',
      weightUnit: 'kg',
      setLengthUnit: (lengthUnit) => set({ lengthUnit }),
      setWeightUnit: (weightUnit) => set({ weightUnit }),
    }),
    {
      name: 'tackle-tally:settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
