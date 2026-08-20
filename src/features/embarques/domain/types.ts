// Datos generales del embarque (antes vivían en los controles de
// Frm2002mbEnc, ahora en un store compartido)
export interface EmbarqueSetupData {
  marketCode: string; // antes "Cod_mercado" / txtMercado
  marketName: string;
  locationCode: string; // antes "Cod_ubicacion" — se resuelve automático tras el login, no lo llena el usuario
  locationName: string;
  saleNumber: string; // antes "No_venta" — solo visible si marketCode !== '01'
  temperature: string;
  transportLineCode: string; // antes "Cod_linea" en Frm2002mbEnc (línea de TRANSPORTE, la empresa)
  transportLineName: string;
  driverCode: string; // antes "Cod_chofer"
  driverName: string;
  tractorCode: string; // antes "Cod_tractor"
  tractorDetail: string;
  boxCode: string; // antes "Cod_caja" (caja/remolque del camión, no caja de producto)
  boxDetail: string;
}

// Posición del pallet dentro del camión — nombres claros en vez de
// "Línea"/"Posición" genéricos que chocaban con la línea de transporte.
// Los valores numéricos (1/2/3) se preservan tal cual porque el backend
// real ya los espera así: 1=izquierda, 2=derecha, 3=centro (el orden
// original no es intuitivo, pero hay que respetarlo).
export type TruckPosition = 'izquierda' | 'derecha' | 'centro';

export const TRUCK_POSITION_CODES: Record<TruckPosition, number> = {
  izquierda: 1,
  derecha: 2,
  centro: 3,
};

export interface EmbarquePalletEntry {
  noPallet: string;
  truckRow: number; // antes "Lin" en Frmc052002MB (HILERA del camión, nada que ver con línea de transporte)
  position: TruckPosition;
  isExcess: boolean; // antes "Exc" / chkExcedente
}

// Info que trae SPC05_ConsPalletMBV2 al escanear un pallet para embarcar
export interface EmbarquePalletInfo {
  producerName: string;
  marketName: string;
  labelName: string;
  productName: string;
  totalBoxes: number;
  status: 'transito' | 'embarcado' | 'disponible';
  isConsolidator: boolean;
  requiresConsolidatorPallet?: string;
  relatedBoxesIncomplete: boolean; // bultos > BtosRel
  allowsPartialShipment: boolean; // ExcValRel != 0
}