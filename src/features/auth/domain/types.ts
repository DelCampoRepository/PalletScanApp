export type AuthStatus = 'loading' | 'unauthenticated' | 'locked' | 'authenticated';

export type UnlockMethod = 'fingerprint' | 'pattern';

export interface StoredSession {
    token: string;
    expiresAt :number;
}