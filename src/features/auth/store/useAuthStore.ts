import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';
import { StoredSession, AuthStatus, AuthUser, UserRole } from '../domain/types';
import { apiClient, ApiError } from '@/shared/services/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocationStore } from '@/shared/store/useLocationStore';
const SERVICE = 'pallet-scan-session';

interface LoginApiResponse {
  token: string;
  expiresAt: string | null;
  username: string;
  roles: string[];
  locationCode: string;
  locationName: string;
}

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
  await Keychain.setGenericPassword('session', JSON.stringify(session), { service: SERVICE });
}

async function clearSession(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICE });
}

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;

  bootstrap: () => Promise<void>;
  loginWithPassword: (username: string, password: string, role: UserRole) => Promise<void>;
  unlock: () => void;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;

  __debugForceExpire: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  status: 'loading',
  user: null,
  error: null,

  bootstrap: async () => {
    const session = await readStoredSession();
    if (!session) {
      await clearSession();
      set({ status: 'unauthenticated', user: null });
      return;
    }
    // El token no expira (decisión de negocio) — si hay sesión guardada,
    // siempre pasa a "locked" en vez de revisar una fecha de vencimiento.
    set({ status: 'locked', user: session.user });
  },

  loginWithPassword: async (username, password, role) => {
    set({ error: null });
    try {
      const response = await apiClient.postNoAuth<LoginApiResponse>('/api/auth/login', {
        username,
        password,
        role,
      });

      const user: AuthUser = {
        username: response.username,
        roles: response.roles as UserRole[],
        locationCode: response.locationCode || undefined,
        locationName: response.locationName || undefined,
      };

      await saveSession({
        token: response.token,
        expiresAt: response.expiresAt ? new Date(response.expiresAt).getTime() : Number.MAX_SAFE_INTEGER,
        user,
      });

      set({ status: 'authenticated', user });
    } catch (err) {
       const apiError = err as ApiError;
         if (apiError.status !== 0) {
           set({ error: apiError.message ?? 'No se pudo iniciar sesión' });
       }
    }
  },

  unlock: () => set({ status: 'authenticated' }),

  logout: async () => {
    await clearSession();
    useLocationStore.getState().clearLocation();
    await AsyncStorage.removeItem('location-storage');
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