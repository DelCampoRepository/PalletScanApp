import { IPalletRepository } from '../domain/IPalletRepository';
import { BoxLabel, PalletInfo, VallidateLabelResults } from '../domain/types';

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const PALLETS: Record<string, PalletInfo> = {
  '1111111111111111': {
    noPallet: '1111111111111111',
    productName: 'Aguacate Hass 4kg',
    totalBoxes: 40,
    relatedBoxes: 0,
    gtin: '00000000000001',
    cancelled: false,
  },
  '2222222222222222': {
    noPallet: '2222222222222222',
    productName: 'Aguacate Hass 4kg',
    totalBoxes: 40,
    relatedBoxes: 40,
    gtin: '00000000000001',
    cancelled: false,
  },
  '3333333333333333': {
    noPallet: '3333333333333333',
    productName: 'Aguacate Hass 4kg',
    totalBoxes: 40,
    relatedBoxes: 0,
    gtin: '00000000000001',
    cancelled: true,
  },
  '4444444444444444': {
    noPallet: '4444444444444444',
    productName: 'Aguacate Hass 4kg (consolidado)',
    totalBoxes: 80,
    relatedBoxes: 10,
    gtin: '00000000000001',
    cancelled: false,
    requiresConsolidatorPallet: '1111111111111111',
  },
  '5555555555555555': {
    noPallet: '5555555555555555',
    productName: 'Aguacate Hass 4kg',
    totalBoxes: 20,
    relatedBoxes: 5,
    gtin: '00000000000002',
    cancelled: false,
  },
};

const ALREADY_RELATED_LABELS = new Set(['9999999999999999']);

export class PalletMockRepository implements IPalletRepository {
  async getPalletInfo(noPallet: string): Promise<PalletInfo | null> {
    return delay(PALLETS[noPallet] ?? null);
  }

  async getExistingLabels(noPallet: string): Promise<BoxLabel[]> {
    const info = PALLETS[noPallet];
    if (!info || info.relatedBoxes === 0) return delay([]);
    const existing: BoxLabel[] = Array.from({ length: info.relatedBoxes }, (_, i) => ({
      code: `EXIST${String(i).padStart(11, '0')}`,
      type: 'campo',
      alreadyOnPallet: true,
    }));
    return delay(existing);
  }

  async validateLabel(noPallet: string, code: string): Promise<VallidateLabelResults> {
    const info = PALLETS[noPallet];
    if (!info) return delay({ ok: false, reason: 'Pallet no válido' });

    if (ALREADY_RELATED_LABELS.has(code)) {
      return delay({ ok: false, reason: 'Esta etiqueta ya está relacionada' });
    }

    const isHarvestMark = code.slice(0, 2).toUpperCase() === 'C_';
    if (isHarvestMark && code.slice(14, 16).toUpperCase() !== 'DC') {
      return delay({ ok: false, reason: 'Etiqueta no válida para este empaque' });
    }

    if (code.startsWith('GTINX')) {
      return delay({ ok: false, reason: 'GTIN diferente al del pallet' });
    }

    return delay({ ok: true });
  }

  async relatePallet(
    _noPallet: string,
    _labels: BoxLabel[],
  ): Promise<{ ok: boolean; syncedAt?: number }> {
    return delay({ ok: true, syncedAt: Date.now() }, 600);
  }
}