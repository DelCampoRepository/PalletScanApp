import { IEmbarquePalletRepository } from '../domain/IEmbarquePalletRepository';
import { EmbarquePalletEntry, EmbarquePalletInfo, EmbarqueSetupData } from '../domain/types';

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// Pallets de prueba, uno por cada escenario real que vimos en
// txtNo_pallet_TextChanged de Frmc052002MB.
const PALLETS: Record<string, EmbarquePalletInfo> = {
  // Disponible, completo, sin problema
  '1111111111111111': {
    producerName: 'Rancho El Aguacate',
    marketName: 'Nacional',
    labelName: 'Etiqueta Estándar',
    productName: 'Aguacate Hass 4kg',
    totalBoxes: 40,
    status: 'disponible',
    isConsolidator: false,
    relatedBoxesIncomplete: false,
    allowsPartialShipment: false,
  },
  // "Pallet se encuentra en transito!"
  '2222222222222222': {
    producerName: 'Rancho El Aguacate',
    marketName: 'Nacional',
    labelName: 'Etiqueta Estándar',
    productName: 'Aguacate Hass 4kg',
    totalBoxes: 40,
    status: 'transito',
    isConsolidator: false,
    relatedBoxesIncomplete: false,
    allowsPartialShipment: false,
  },
  // "Pallet se encuentra embarcado!"
  '3333333333333333': {
    producerName: 'Rancho El Aguacate',
    marketName: 'Nacional',
    labelName: 'Etiqueta Estándar',
    productName: 'Aguacate Hass 4kg',
    totalBoxes: 40,
    status: 'embarcado',
    isConsolidator: false,
    relatedBoxesIncomplete: false,
    allowsPartialShipment: false,
  },
  // Incompleta, pero SÍ permite continuar con advertencia (ExcValRel != 0)
  '4444444444444444': {
    producerName: 'Rancho El Aguacate',
    marketName: 'Nacional',
    labelName: 'Etiqueta Estándar',
    productName: 'Aguacate Hass 4kg',
    totalBoxes: 40,
    status: 'disponible',
    isConsolidator: false,
    relatedBoxesIncomplete: true,
    allowsPartialShipment: true,
  },
  // Incompleta, y NO permite continuar bajo ninguna circunstancia
  '5555555555555555': {
    producerName: 'Rancho El Aguacate',
    marketName: 'Nacional',
    labelName: 'Etiqueta Estándar',
    productName: 'Aguacate Hass 4kg',
    totalBoxes: 40,
    status: 'disponible',
    isConsolidator: false,
    relatedBoxesIncomplete: true,
    allowsPartialShipment: false,
  },
  // Consolidador: el total ya viene recalculado sumando sub-pallets
  '6666666666666666': {
    producerName: 'Rancho El Aguacate',
    marketName: 'Nacional',
    labelName: 'Etiqueta Estándar',
    productName: 'Aguacate Hass 4kg (consolidado)',
    totalBoxes: 80,
    status: 'disponible',
    isConsolidator: true,
    relatedBoxesIncomplete: false,
    allowsPartialShipment: false,
  },
};

export class EmbarquePalletMockRepository implements IEmbarquePalletRepository {
  async getPalletInfo(noPallet: string): Promise<EmbarquePalletInfo | null> {
    return delay(PALLETS[noPallet] ?? null);
  }

  async saveEmbarque(
    _setup: EmbarqueSetupData,
    pallets: EmbarquePalletEntry[],
  ): Promise<{ ok: boolean; embarqueNumber?: number; totalPallets?: number }> {
    return delay(
      { ok: true, embarqueNumber: Math.floor(Math.random() * 9000) + 1000, totalPallets: pallets.length },
      600,
    );
  }
}