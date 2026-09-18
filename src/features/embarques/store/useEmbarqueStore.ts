import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmbarquePalletEntry, EmbarqueSetupData } from '../domain/types';

interface EmbarqueState {
  setupData: EmbarqueSetupData | null;
  pallets: EmbarquePalletEntry[];
  hasHydrated: boolean;
  
  
  setSetupField: <K extends keyof EmbarqueSetupData>(field: K, value: EmbarqueSetupData[K]) => void;
  setLocationFromLogin: (locationCode: string, locationName: string) => void;
  isSetupComplete: () => boolean;

  addOrUpdatePallet: (entry: EmbarquePalletEntry) => void;
  removePallet: (noPallet: string) => void;
  findPallet: (noPallet: string) => EmbarquePalletEntry | undefined;

  resetSetup: () => void;
  clearPallets: () => void;
  resetAll: () => void;
  setHasHydrated: (value: boolean) => void;
  
}

const EMPTY_SETUP: EmbarqueSetupData = {
  marketCode: '',
  marketName: '',
  locationCode: '',
  locationName: '',
  saleNumber: '',
  temperature: '',
  transportLineCode: '',
  transportLineName: '',
  driverCode: '',
  driverName: '',
  tractorCode: '',
  tractorDetail: '',
  boxCode: '',
  boxDetail: '',
};

export const useEmbarqueStore = create<EmbarqueState>()(
  
  persist(
    (set, get) => ({
      setupData: null,
      pallets: [],
      hasHydrated: false,
      
      clearPallets: () => set({ pallets: [] }),
      setSetupField: (field, value) => {
        const current = get().setupData ?? { ...EMPTY_SETUP };
        set({ setupData: { ...current, [field]: value } });
      },

      setLocationFromLogin: (locationCode, locationName) => {
        const current = get().setupData ?? { ...EMPTY_SETUP };
        set({ setupData: { ...current, locationCode, locationName } });
      },

      isSetupComplete: () => {
        const s = get().setupData;
        if (!s) return false;
        return !!(
          s.marketCode &&
          s.marketName &&
          s.temperature &&
          s.transportLineCode &&
          s.transportLineName &&
          s.driverCode &&
          s.driverName &&
          s.tractorCode &&
          s.tractorDetail &&
          s.boxCode &&
          s.boxDetail
        );
      },

      addOrUpdatePallet: (entry) => {
        set((state) => {
          const exists = state.pallets.some((p) => p.noPallet === entry.noPallet);
          if (exists) {
            return {
              pallets: state.pallets.map((p) => (p.noPallet === entry.noPallet ? entry : p)),
            };
          }
          return { pallets: [...state.pallets, entry] };
        });
      },

      removePallet: (noPallet) => {
        set((state) => ({ pallets: state.pallets.filter((p) => p.noPallet !== noPallet) }));
      },

      findPallet: (noPallet) => {
        return get().pallets.find((p) => p.noPallet === noPallet);
      },

      resetSetup: () => set({ setupData: null }),

      resetAll: () => set({ setupData: null, pallets: [] }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'embarque-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Solo persistimos la lista de pallets — el setup (mercado, chofer,
      // etc.) se vuelve a capturar cada sesión, igual que el sistema viejo.
      partialize: (state) => ({ pallets: state.pallets }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);