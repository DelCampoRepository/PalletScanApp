import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationOption, LOCATIONS } from '../config/locations';

interface LocationState {
  selected: LocationOption | null;
  hasHydrated: boolean;
  selectLocation: (code: string) => void;
  clearLocation: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      selected: null,
      hasHydrated: false,

      selectLocation: (code) => {
        const found = LOCATIONS.find((l) => l.code === code);
        if (found) set({ selected: found });
      },

      clearLocation: () => set({ selected: null }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);