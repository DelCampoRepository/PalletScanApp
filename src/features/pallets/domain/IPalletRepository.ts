import { BoxLabel, PalletInfo, VallidateLabelResults } from "./types";

export interface  IPalletRepository{
    getPalletInfo(noPallet:string): Promise<PalletInfo |null>;
    getExistingLabels(noPallet:string): Promise<BoxLabel[]>;
    validateLabel(noPallet: string, code: string): Promise<VallidateLabelResults>;
    relatePallet(noPallet: string, labels: BoxLabel[]): Promise<{ ok: boolean; syncedAt?: number }>;
}