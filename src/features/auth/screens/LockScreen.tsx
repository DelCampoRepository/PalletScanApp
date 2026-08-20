import { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import IconFingerprint from '@tabler/icons-react-native/IconFingerprint';
import IconGridDots from '@tabler/icons-react-native/IconGridDots';
import IconLogout from '@tabler/icons-react-native/IconLogout';
import { isSensorAvailable, simplePrompt } from '@sbaiahmed1/react-native-biometrics';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { PatternGrid } from '@/features/auth/components/PatternGrid';
import { hasPatternConfigured, verifyPattern } from '@/features/auth/services/patternService';
import { getPreferredMethod, type AuthMethod } from '@/features/auth/services/authPreferenceService';

export function LockScreen() {
  const unlock = useAuthStore((s) => s.unlock);
  const logout = useAuthStore((s) => s.logout);

  const [biometryAvailable, setBiometryAvailable] = useState(false);
  const [patternConfigured, setPatternConfigured] = useState(false);
  const [activeMethod, setActiveMethod] = useState<AuthMethod | null>(null);
  const [fingerprintError, setFingerprintError] = useState<string | null>(null);
  const [patternError, setPatternError] = useState<string | null>(null);
  const [patternResetKey, setPatternResetKey] = useState(0);

  useEffect(() => {
    async function init() {
      const [sensorInfo, patternExists, preferred] = await Promise.all([
        isSensorAvailable(),
        hasPatternConfigured(),
        getPreferredMethod(),
      ]);

      setBiometryAvailable(sensorInfo.available);
      setPatternConfigured(patternExists);

      let resolved: AuthMethod | null = null;
      if (preferred === 'fingerprint' && sensorInfo.available) resolved = 'fingerprint';
      else if (preferred === 'pattern' && patternExists) resolved = 'pattern';
      else if (sensorInfo.available) resolved = 'fingerprint';
      else if (patternExists) resolved = 'pattern';

      setActiveMethod(resolved);
    }
    init();
  }, []);

  const handleFingerprint = useCallback(async () => {
    setFingerprintError(null);
    try {
      const success = await simplePrompt('Confirma tu identidad');
      if (success) {
        unlock();
      } else {
        setFingerprintError('No se reconoció tu huella, intenta de nuevo');
      }
    } catch (error) {
      console.log('Error de biometría:', error);
      setFingerprintError('Autenticación cancelada, intenta de nuevo');
    }
  }, [unlock]);

  useEffect(() => {
    if (activeMethod === 'fingerprint') {
      handleFingerprint();
    }
  }, [activeMethod, handleFingerprint]);

  async function handlePatternComplete(pattern: number[]) {
    const matches = await verifyPattern(pattern);
    if (matches) {
      unlock();
    } else {
      setPatternError('Patrón incorrecto, intenta de nuevo');
      setPatternResetKey((k) => k + 1);
    }
  }

  const canOfferFingerprint = biometryAvailable;
  const canOfferPattern = patternConfigured;

  return (
    <View className="flex-1 justify-center items-center bg-paper px-6">
      <View className="w-full bg-white rounded p-6 gap-5 border border-line">
        <View className="items-center gap-1">
          <Text className="text-steel text-[11px] tracking-widest uppercase font-mono">
            Sesión activa
          </Text>
          <Text className="text-2xl font-medium text-ink mt-1">Confirma que eres tú</Text>
        </View>

        {activeMethod === 'fingerprint' && (
          <View className="items-center gap-4 mt-2">
            <Pressable
              onPress={handleFingerprint}
              className="w-20 h-20 rounded-full bg-ink border-2 border-pulp items-center justify-center"
            >
              <IconFingerprint size={36} color="#C7D93E" />
            </Pressable>
            <Pressable className="bg-pulp rounded p-3 w-full" onPress={handleFingerprint}>
              <Text className="text-ink text-center font-medium">Usar huella</Text>
            </Pressable>
            {fingerprintError && (
              <Text className="text-rust text-center text-sm">{fingerprintError}</Text>
            )}
          </View>
        )}

        {activeMethod === 'pattern' && (
          <View className="items-center gap-3 mt-2">
            <View className="flex-row items-center gap-1.5 mb-1">
              <IconGridDots size={14} color="#6E7C74" />
              <Text className="text-steel text-[11px] tracking-wide uppercase">Patrón</Text>
            </View>
            <PatternGrid key={patternResetKey} onComplete={handlePatternComplete} />
            {patternError && (
              <Text className="text-rust text-center text-sm">{patternError}</Text>
            )}
          </View>
        )}

        <View className="items-center gap-2 mt-2">
          {activeMethod === 'fingerprint' && canOfferPattern && (
            <Pressable onPress={() => setActiveMethod('pattern')}>
              <Text className="text-steel font-medium">Usar patrón en su lugar</Text>
            </Pressable>
          )}
          {activeMethod === 'pattern' && canOfferFingerprint && (
            <Pressable onPress={() => setActiveMethod('fingerprint')}>
              <Text className="text-steel font-medium">Usar huella en su lugar</Text>
            </Pressable>
          )}

          <Pressable
            className="flex-row items-center gap-1.5 mt-3"
            onPress={logout}
          >
            <IconLogout size={14} color="#6E7C74" />
            <Text className="text-steel text-sm">Cerrar sesión</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}