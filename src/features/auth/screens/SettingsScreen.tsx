import { useCallback, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { isSensorAvailable } from '@sbaiahmed1/react-native-biometrics';
import { hasPatternConfigured } from '@/features/auth/services/patternService';
import {
  getPreferredMethod,
  setPreferredMethod,
  type AuthMethod,
} from '@/features/auth/services/authPreferenceService';

export function SettingsScreen({ navigation }: any) {
  const [biometryAvailable, setBiometryAvailable] = useState(false);
  const [patternConfigured, setPatternConfigured] = useState(false);
  const [preferredMethod, setPreferredMethodState] = useState<AuthMethod | null>(null);

  const loadState = useCallback(() => {
    isSensorAvailable().then((info) => setBiometryAvailable(info.available));
    hasPatternConfigured().then(setPatternConfigured);
    getPreferredMethod().then(setPreferredMethodState);
  }, []);

  // Se recarga cada vez que esta pantalla vuelve a tener foco (por ejemplo,
  // al regresar de configurar el patrón) — no solo la primera vez.
  useFocusEffect(
    useCallback(() => {
      loadState();
    }, [loadState]),
  );

  async function choosePreferred(method: AuthMethod) {
    await setPreferredMethod(method);
    setPreferredMethodState(method);
  }

  return (
    <View className="flex-1 bg-white px-6 pt-6 gap-8">
      <View className="gap-2">
        <Text className="text-lg font-bold">Método preferido</Text>
        <Text className="text-gray-500 text-sm mb-2">
          Se usa primero al reabrir la app. El otro método sigue disponible como respaldo.
        </Text>

        <Pressable
          disabled={!biometryAvailable}
          onPress={() => choosePreferred('fingerprint')}
          className={`border rounded-lg p-3 flex-row justify-between items-center ${
            biometryAvailable ? 'border-gray-300' : 'border-gray-200 opacity-40'
          }`}
        >
          <Text>Huella{!biometryAvailable ? ' (no disponible)' : ''}</Text>
          {preferredMethod === 'fingerprint' && <Text className="text-blue-600 font-bold">✓</Text>}
        </Pressable>

        <Pressable
          disabled={!patternConfigured}
          onPress={() => choosePreferred('pattern')}
          className={`border rounded-lg p-3 flex-row justify-between items-center ${
            patternConfigured ? 'border-gray-300' : 'border-gray-200 opacity-40'
          }`}
        >
          <Text>Patrón{!patternConfigured ? ' (sin configurar)' : ''}</Text>
          {preferredMethod === 'pattern' && <Text className="text-blue-600 font-bold">✓</Text>}
        </Pressable>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-bold">Patrón de desbloqueo</Text>
        <Pressable
          className="bg-gray-700 rounded-lg p-3"
          onPress={() => navigation.navigate('SetPattern')}
        >
          <Text className="text-white text-center font-semibold">
            {patternConfigured ? 'Cambiar patrón' : 'Configurar patrón'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}