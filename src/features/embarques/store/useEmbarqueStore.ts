import { create } from 'zustand';
import { EmbarquePalletEntry, EmbarqueSetupData } from '../domain/types';

interface EmbarqueState {
  setupData: EmbarqueSetupData | null;
  pallets: EmbarquePalletEntry[];

  setSetupField: <K extends keyof EmbarqueSetupData>(field: K, value: EmbarqueSetupData[K]) => void;
  setLocationFromLogin: (locationCode: string, locationName: string) => void;
  isSetupComplete: () => boolean;

  addOrUpdatePallet: (entry: EmbarquePalletEntry) => void;
  removePallet: (noPallet: string) => void;
  findPallet: (noPallet: string) => EmbarquePalletEntry | undefined;

  resetSetup: () => void;
  resetAll: () => void;
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

export const useEmbarqueStore = create<EmbarqueState>()((set, get) => ({
  setupData: null,
  pallets: [],

  setSetupField: (field, value) => {
    const current = get().setupData ?? { ...EMPTY_SETUP };
    set({ setupData: { ...current, [field]: value } });
  },

  // Se llama justo después del login del rol "embarque" — la ubicación
  // nunca la llena el usuario, viene resuelta del backend (dmc0524/dmc0516
  // en el sistema viejo).
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
}));