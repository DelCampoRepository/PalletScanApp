import * as  Keychain from 'react-native-keychain';
import { sha256 } from '@sbaiahmed1/react-native-biometrics';

const PATTERN_SERVICE = 'pallet-scan-pattern';

function serializePattern(pattern: number[]): string {
    return pattern.join('_');
    
}

export async function hasPatternConfigured(): Promise<boolean> {
    const credentials = await Keychain.getGenericPassword({service: PATTERN_SERVICE});
    return !!credentials;
}

export async function savePattern(pattern: number[]): Promise<void>{
    const {hash} = await sha256(serializePattern(pattern));
    await Keychain.setGenericPassword('pattern', hash, {service: PATTERN_SERVICE});
}

export async function verifyPattern(pattern: number[]): Promise<boolean>{
    const credentials = await Keychain.getGenericPassword({service: PATTERN_SERVICE});
    if(!credentials) return false;
    const {hash} = await sha256(serializePattern(pattern));
    return hash === credentials.password;
}