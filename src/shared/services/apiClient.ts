import * as Keychain from 'react-native-keychain';
import { useLocationStore } from '@/shared/store/useLocationStore';
import { useNetworkErrorStore } from '@/shared/store/useNetworkErrorStore';

const SERVICE = 'pallet-scan-session';

export interface ApiError {
  message: string;
  status: number;
}

async function getToken(): Promise<string | null> {
  const credentials = await Keychain.getGenericPassword({ service: SERVICE });
  if (!credentials) return null;
  try {
    const session = JSON.parse(credentials.password);
    return session.token ?? null;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = useLocationStore.getState().selected?.apiBaseUrl;
  if (!baseUrl) {
    // Caso defensivo: no debería pasar, ya que RootNavigator obliga a
    // elegir ubicación antes de llegar aquí. No dispara el modal de red,
    // porque no es un problema de conexión.
    throw { message: 'No se ha seleccionado una ubicación', status: -1 } as ApiError;
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const message = 'No se pudo conectar con el servidor. Revisa tu conexión a internet.';
    useNetworkErrorStore.getState().show(message);
    throw { message, status: 0 } as ApiError;
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // respuesta sin cuerpo
  }

  if (!response.ok) {
    throw {
      message: data?.message ?? data?.title ?? 'Error inesperado del servidor',
      status: response.status,
    } as ApiError;
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  postNoAuth: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body, auth: false }),
};