export interface PalletInfo {
  noPallet: string;
  productName: string;
  totalBoxes: number;
  relatedBoxes: number;
  gtin: string;
  cancelled: boolean;
  requiresConsolidatorPallet?: string;
}

export type LabelType = 'campo' | 'harvestmark';

export interface BoxLabel {
  code: string;
  type: LabelType;
  alreadyOnPallet?: boolean;
}

export interface VallidateLabelResults {
  ok: boolean;
  reason?: string;
}