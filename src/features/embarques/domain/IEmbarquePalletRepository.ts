import { EmbarquePalletEntry, EmbarquePalletInfo, EmbarqueSetupData } from './types';

export interface IEmbarquePalletRepository {
  // Reemplaza SPC05_ConsPalletMBV2
  getPalletInfo(noPallet: string): Promise<EmbarquePalletInfo | null>;

  // Reemplaza SPC05_InsertaPalletEmbarcarMB
  saveEmbarque(
    setup: EmbarqueSetupData,
    pallets: EmbarquePalletEntry[],
  ): Promise<{ ok: boolean; embarqueNumber?: number; totalPallets?: number }>;
}