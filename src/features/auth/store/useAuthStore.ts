import { create } from 'zustand';
import { StoredSession, AuthStatus, AuthUser, UserRole } from '../domain/types';
import * as Keychain from 'react-native-keychain';

const SERVICE = 'pallet-scan-session';

// Usuarios de prueba. Cuando conectemos la API real, esto se reemplaza
// por la llamada al backend — el resto del store no cambia.
const MOCK_USERS: Array<{ username: string; password: string; roles: UserRole[] }> = [
  { username: 'embarque1', password: '1234', roles: ['embarque'] },
  { username: 'validacion1', password: '1234', roles: ['validacion'] },
];

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
  await Keychain.setGenericPassword('session', JSON.stringify(session), {
    service: SERVICE,
  });
}

async function clearSession(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICE });
}

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;

  bootstrap: () => Promise<void>;
  loginWithPassword: (username: string, password: string) => Promise<void>;
  unlock: () => void;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;

  __debugForceExpire: () => Promise<void>;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  status: 'loading',
  user: null,
  error: null,

  bootstrap: async () => {
    const session = await readStoredSession();
    if (!session || session.expiresAt < Date.now()) {
      await clearSession();
      set({ status: 'unauthenticated', user: null });
      return;
    }
    set({ status: 'locked', user: session.user });
  },

  loginWithPassword: async (username, password) => {
    set({ error: null });
    await delay(400);

    const found = MOCK_USERS.find((u) => u.username === username && u.password === password);
    if (!found) {
      set({ error: 'Usuario o contraseña incorrectos' });
      return;
    }

    const user: AuthUser = { username: found.username, roles: found.roles };
    await saveSession({
      token: `mock-token-${username}`,
      expiresAt: Date.now() + 1000 * 60 * 60 * 8,
      user,
    });
    set({ status: 'authenticated', user });
  },

  unlock: () => set({ status: 'authenticated' }),

  logout: async () => {
    await clearSession();
    set({ status: 'unauthenticated', user: null });
  },

  hasRole: (role) => {
    const { user } = get();
    return !!user?.roles.includes(role);
  },

  __debugForceExpire: async () => {
    await clearSession();
    set({ status: 'unauthenticated', user: null });
  },
}));