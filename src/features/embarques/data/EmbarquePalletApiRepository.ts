import { apiClient, ApiError } from '@/shared/services/apiClient';
import { IEmbarquePalletRepository } from '../domain/IEmbarquePalletRepository';
import { EmbarquePalletEntry, EmbarquePalletInfo, EmbarqueSetupData } from '../domain/types';

interface SaveEmbarqueApiResponse {
  ok: boolean;
  embarqueNumber?: number;
  totalPallets?: number;
}

export class EmbarquePalletApiRepository implements IEmbarquePalletRepository {
  async getPalletInfo(noPallet: string): Promise<EmbarquePalletInfo | null> {
    try {
      return await apiClient.get<EmbarquePalletInfo>(`/api/embarques/pallets/${noPallet}`);
    } catch (err) {
      if ((err as ApiError).status === 404) {
        return null; // Pallet inexistente o cancelado — no es un error real, es un resultado válido
      }
      throw err;
    }
  }

  async saveEmbarque(
    setup: EmbarqueSetupData,
    pallets: EmbarquePalletEntry[],
  ): Promise<{ ok: boolean; embarqueNumber?: number; totalPallets?: number }> {
    return apiClient.post<SaveEmbarqueApiResponse>('/api/embarques', {
      marketCode: setup.marketCode,
      locationCode: setup.locationCode,
      saleNumber: setup.saleNumber,
      transportLineCode: setup.transportLineCode,
      driverCode: setup.driverCode,
      tractorCode: setup.tractorCode,
      boxCode: setup.boxCode,
      temperature: setup.temperature,
      pallets,
    });
  }
}