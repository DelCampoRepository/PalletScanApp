export type AuthStatus = 'loading' | 'unauthenticated' | 'locked' | 'authenticated';

export type UnlockMethod = 'fingerprint' | 'pattern';

export type UserRole = 'embarque' | 'validacion';

export interface AuthUser {
  username: string;
  roles: UserRole[];
}

export interface StoredSession {
  token: string;
  expiresAt: number;
  user: AuthUser;
}