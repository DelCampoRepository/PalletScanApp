import { CatalogItem, ICatalogRepository } from '../domain/ICatalogRepository';

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const MARKETS: CatalogItem[] = [
  { code: '01', description: 'Nacional' },
  { code: '02', description: 'Estados Unidos' },
  { code: '03', description: 'Europa' },
];

const TRANSPORT_LINES: CatalogItem[] = [
  { code: '001', description: 'Transportes del Norte' },
  { code: '099', description: 'Nacional (sin datos de transporte)' },
];

// Choferes/tractores/cajas de prueba, filtrados por línea de transporte
const DRIVERS_BY_LINE: Record<string, CatalogItem[]> = {
  '001': [{ code: '001', description: 'Juan Pérez' }],
};

const TRACTORS_BY_LINE: Record<string, CatalogItem[]> = {
  '001': [{ code: '001', description: 'T-101 PlacasMX:ABC123' }],
};

const BOXES_BY_LINE: Record<string, CatalogItem[]> = {
  '001': [{ code: '001', description: 'C-201 PlacasMX:XYZ789' }],
};

export class CatalogMockRepository implements ICatalogRepository {
  async getMarkets(): Promise<CatalogItem[]> {
    return delay(MARKETS);
  }

  async getTransportLines(): Promise<CatalogItem[]> {
    return delay(TRANSPORT_LINES);
  }

  async getDrivers(transportLineCode: string): Promise<CatalogItem[]> {
    return delay(DRIVERS_BY_LINE[transportLineCode] ?? []);
  }

  async getTractors(transportLineCode: string): Promise<CatalogItem[]> {
    return delay(TRACTORS_BY_LINE[transportLineCode] ?? []);
  }

  async getBoxes(transportLineCode: string): Promise<CatalogItem[]> {
    return delay(BOXES_BY_LINE[transportLineCode] ?? []);
  }
}