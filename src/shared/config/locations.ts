export interface LocationOption {
  code: string;
  name: string;
  apiBaseUrl: string;
}

export const LOCATIONS: LocationOption[] = [
  { code: 'CUL', name: 'Culiacán', apiBaseUrl: 'http://185.100.15.213:5000' },
  { code: 'JAL', name: 'Jalisco', apiBaseUrl: 'http://185.100.15.203:5000' },
  { code: 'LCZ', name: 'La Cruz', apiBaseUrl: 'http://TU_IP_LACRUZ:5000' },
];