import { create } from 'zustand';
import { StoredSession, AuthStatus } from '../domain/types';
import * as Keychain from 'react-native-keychain';

// Nombre único para agrupar este dato dentro del Keystore/Keychain del
// sistema — así no choca si más adelante guardamos otras credenciales.
const SERVICE = 'pallet-scan-session';

async function readStoredSession(): Promise<StoredSession | null> {
  const credentials = await Keychain.getGenericPassword({ service: SERVICE });
  if (!credentials) return null;
  try {
    return JSON.parse(credentials.password) as StoredSession;
  } catch {
    return null;
  }
}

async function saveSession(session: StoredSession): Promise<void> {
  // Keychain solo guarda strings, por eso serializamos el objeto completo
  await Keychain.setGenericPassword('session', JSON.stringify(session), {
    service: SERVICE,
  });
}

async function clearSession(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICE });
}


interface AuthState {
  status: AuthStatus;
  error: string | null;

  bootstrap: () => Promise<void>;
  loginWithPassword: (username: string, password: string) => Promise<void>;
  unlock: () => void; // se llama cuando huella/patrón confirma correctamente
  logout: () => Promise<void>;

  // Solo para pruebas mientras no hay keychain real:
  __debugForceExpire: () => Promise<void>;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  error: null,

  bootstrap: async () => {
    const session = await readStoredSession();
    if (!session || session.expiresAt < Date.now()) {
      await clearSession();
      set({ status: 'unauthenticated' });
      return;
    }
    // Hay token válido: pedimos huella/patrón antes de dejar pasar
    set({ status: 'locked' });
  },

  loginWithPassword: async (username, password) => {
    set({ error: null });
    await delay(400);
    // Mock: cualquier usuario/contraseña no vacíos "funciona" por ahora
    if (!username || !password) {
      set({ error: 'Usuario o contraseña incorrectos' });
      return;
    }
    await saveSession({
      token: `mock-token-${username}`,
      expiresAt: Date.now() + 1000 * 60 * 60 * 8, // 8 horas
    });
    set({ status: 'authenticated' });
  },

  unlock: () => set({ status: 'authenticated' }),

  logout: async () => {
    await clearSession();
    set({ status: 'unauthenticated' });
  },

  __debugForceExpire: async () => {
    await clearSession();
    set({ status: 'unauthenticated' });
  },
}));