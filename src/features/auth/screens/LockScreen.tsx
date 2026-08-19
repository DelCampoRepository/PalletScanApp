import { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { isSensorAvailable, simplePrompt } from '@sbaiahmed1/react-native-biometrics';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { PatternGrid } from '@/features/auth/components/PatternGrid';
import { hasPatternConfigured, verifyPattern } from '@/features/auth/services/patternService';
import { getPreferredMethod, type AuthMethod } from '@/features/auth/services/authPreferenceService';

export function LockScreen() {
  const unlock = useAuthStore((s) => s.unlock);
  const logout = useAuthStore((s) => s.logout);

  const [biometryAvailable, setBiometryAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<string | undefined>();
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
      setBiometryType(sensorInfo.biometryType);
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
    } catch {
      // Cubre cancelación u otros rechazos de la promesa, que no
      // siempre resuelven `false` como indica la documentación.
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
    <View className="flex-1 justify-center items-center bg-gray-50 px-6">
      <View className="w-full bg-white rounded-2xl p-6 gap-5 shadow-sm border border-gray-100">
        <View className="items-center gap-1">
          <Text className="text-2xl font-bold text-gray-900">Confirma que eres tú</Text>
          <Text className="text-gray-500 text-center">
            Tu sesión sigue activa, solo necesitamos verificar tu identidad
          </Text>
        </View>

        {activeMethod === 'fingerprint' && (
          <View className="items-center gap-4 mt-2">
            <Pressable
              onPress={handleFingerprint}
              className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-500 items-center justify-center"
            >
              <Text className="text-4xl">👆</Text>
            </Pressable>
            <Pressable className="bg-blue-600 rounded-lg p-3 w-full" onPress={handleFingerprint}>
              <Text className="text-white text-center font-semibold">
                Usar {biometryType === 'Fingerprint' ? 'huella' : biometryType}
              </Text>
            </Pressable>
            {fingerprintError && (
              <Text className="text-red-600 text-center text-sm">{fingerprintError}</Text>
            )}
          </View>
        )}

        {activeMethod === 'pattern' && (
          <View className="items-center gap-3 mt-2">
            <PatternGrid key={patternResetKey} onComplete={handlePatternComplete} />
            {patternError && (
              <Text className="text-red-600 text-center text-sm">{patternError}</Text>
            )}
          </View>
        )}

        <View className="items-center gap-2 mt-2">
          {activeMethod === 'fingerprint' && canOfferPattern && (
            <Pressable onPress={() => setActiveMethod('pattern')}>
              <Text className="text-blue-600 font-medium">Usar patrón en su lugar</Text>
            </Pressable>
          )}
          {activeMethod === 'pattern' && canOfferFingerprint && (
            <Pressable onPress={() => setActiveMethod('fingerprint')}>
              <Text className="text-blue-600 font-medium">Usar huella en su lugar</Text>
            </Pressable>
          )}

          <Pressable onPress={logout} className="mt-3">
            <Text className="text-gray-400 text-sm">Cerrar sesión</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}