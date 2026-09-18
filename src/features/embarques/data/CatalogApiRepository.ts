import { apiClient } from '@/shared/services/apiClient';
import { CatalogItem, ICatalogRepository } from '../domain/ICatalogRepository';

interface RawCatalogItem {
  codigo: string;
  descripcion: string;
}

function normalize(items: RawCatalogItem[]): CatalogItem[] {
  return items.map((item) => ({
    code: item.codigo.trim(),
    description: item.descripcion.trim(),
  }));
}

export class CatalogApiRepository implements ICatalogRepository {
  async getMarkets(): Promise<CatalogItem[]> {
    const raw = await apiClient.get<RawCatalogItem[]>('/api/catalogs/markets');
    return normalize(raw);
  }

  async getTransportLines(): Promise<CatalogItem[]> {
    const raw = await apiClient.get<RawCatalogItem[]>('/api/catalogs/transport-lines');
    return normalize(raw);
  }

  async getDrivers(transportLineCode: string): Promise<CatalogItem[]> {
    const raw = await apiClient.get<RawCatalogItem[]>(
      `/api/catalogs/drivers?transportLineCode=${encodeURIComponent(transportLineCode)}`,
    );
    return normalize(raw);
  }

  async getTractors(transportLineCode: string): Promise<CatalogItem[]> {
    const raw = await apiClient.get<RawCatalogItem[]>(
      `/api/catalogs/tractors?transportLineCode=${encodeURIComponent(transportLineCode)}`,
    );
    return normalize(raw);
  }

  async getBoxes(transportLineCode: string): Promise<CatalogItem[]> {
    const raw = await apiClient.get<RawCatalogItem[]>(
      `/api/catalogs/boxes?transportLineCode=${encodeURIComponent(transportLineCode)}`,
    );
    return normalize(raw);
  }
}