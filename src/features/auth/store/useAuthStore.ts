import { create } from 'zustand';
import { StoredSession, AuthStatus } from '../domain/types';

// ⚠️ SIMULADO por ahora: en vez de guardar/leer de react-native-keychain,
// usamos esta variable en memoria. Cuando instalemos keychain, solo se
// reemplazan las 3 funciones de abajo (readStoredSession, saveSession,
// clearSession) — el resto del store no cambia.
let fakeStorage: StoredSession | null = null;

async function readStoredSession(): Promise<StoredSession | null> {
  return fakeStorage;
}

async function saveSession(session: StoredSession): Promise<void> {
  fakeStorage = session;
}

async function clearSession(): Promise<void> {
  fakeStorage = null;
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