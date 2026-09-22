import { create } from 'zustand';

interface NetworkErrorState {
  visible: boolean;
  message: string;
  show: (message: string) => void;
  hide: () => void;
}

export const useNetworkErrorStore = create<NetworkErrorState>()((set) => ({
  visible: false,
  message: '',
  show: (message) => set({ visible: true, message }),
  hide: () => set({ visible: false, message: '' }),
}));