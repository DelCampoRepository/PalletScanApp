import * as Keychain from 'react-native-keychain';

const PREFERENCE_SERVICE = 'pallet-scan-auth-preference';

export type AuthMethod = 'fingerprint' | 'pattern';

export async function getPreferredMethod(): Promise<AuthMethod> {
  const credentials = await Keychain.getGenericPassword({ service: PREFERENCE_SERVICE });
  if (!credentials) return 'pattern'; // default pedido: patrón primero si nunca se configuró nada
  return credentials.password === 'fingerprint' ? 'fingerprint' : 'pattern';
}

export async function setPreferredMethod(method: AuthMethod): Promise<void> {
  await Keychain.setGenericPassword('preference', method, { service: PREFERENCE_SERVICE });
}