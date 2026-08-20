export interface CatalogItem {
  code: string;
  description: string;
}

export interface ICatalogRepository {
  getMarkets(): Promise<CatalogItem[]>;
  getTransportLines(): Promise<CatalogItem[]>;
  getDrivers(transportLineCode: string): Promise<CatalogItem[]>;
  getTractors(transportLineCode: string): Promise<CatalogItem[]>;
  getBoxes(transportLineCode: string): Promise<CatalogItem[]>;
}