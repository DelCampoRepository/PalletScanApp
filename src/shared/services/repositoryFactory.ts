import { IPalletRepository } from '@/features/pallets/domain/IPalletRepository';
import { PalletMockRepository } from '@/features/pallets/data/PalletMockRepository';
//import { ICatalogRepository } from '@/features/embarques/domain/ICatalogRepository';
//import { CatalogMockRepository } from '@/features/embarques/data/CatalogMockRepository';

import { ICatalogRepository } from '@/features/embarques/domain/ICatalogRepository';
import { CatalogApiRepository } from '@/features/embarques/data/CatalogApiRepository';


export const palletRepository: IPalletRepository = new PalletMockRepository();
//export const catalogRepository: ICatalogRepository = new CatalogMockRepository();



import { IEmbarquePalletRepository } from '@/features/embarques/domain/IEmbarquePalletRepository';

//import { EmbarquePalletMockRepository } from '@/features/embarques/data/EmbarquePalletMockRepository';
import { EmbarquePalletApiRepository } from '@/features/embarques/data/EmbarquePalletApiRepository';


//export const embarquePalletRepository: IEmbarquePalletRepository = new EmbarquePalletMockRepository();
export const embarquePalletRepository: IEmbarquePalletRepository = new EmbarquePalletApiRepository();
export const catalogRepository: ICatalogRepository = new CatalogApiRepository();