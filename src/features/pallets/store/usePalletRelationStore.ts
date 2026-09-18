import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BoxLabel, PalletInfo } from '../domain/types';

interface PalletRelationState {
  palletCode: string | null;
  palletInfo: PalletInfo | null;
  scannedLabels: BoxLabel[];
  hasHydrated: boolean;

  setPallet: (code: string, info: PalletInfo, existingLabels: BoxLabel[]) => void;
  addLabel: (label: BoxLabel) => void;
  removeLabel: (code: string) => void;
  clearLabels: () => void;
  resetAll: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const usePalletRelationStore = create<PalletRelationState>()(
  persist(
    (set) => ({
      palletCode: null,
      palletInfo: null,
      scannedLabels: [],
      hasHydrated: false,

      setPallet: (code, info, existingLabels) =>
        set({ palletCode: code, palletInfo: info, scannedLabels: existingLabels }),

      addLabel: (label) => set((state) => ({ scannedLabels: [...state.scannedLabels, label] })),

      removeLabel: (code) =>
        set((state) => ({ scannedLabels: state.scannedLabels.filter((l) => l.code !== code) })),

      clearLabels: () => set({ scannedLabels: [] }),

      resetAll: () => set({ palletCode: null, palletInfo: null, scannedLabels: [] }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'pallet-relation-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);