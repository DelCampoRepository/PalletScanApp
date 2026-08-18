import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { isSensorAvailable, simplePrompt } from '@sbaiahmed1/react-native-biometrics';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { PatternGrid } from '../components/PatternGrid';



export function LockScreen() {
  const unlock = useAuthStore((s) => s.unlock);
  const logout = useAuthStore((s) => s.logout);
  const [biometryAvailable, setBiometryAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<string | undefined>();

  useEffect(() => {
    isSensorAvailable().then((sensorInfo) => {
      setBiometryAvailable(sensorInfo.available);
      setBiometryType(sensorInfo.biometryType);
    });
  }, []);

  async function handleFingerprint() {
    const success = await simplePrompt('Confirma tu identidad');
    if (success) {
      unlock();
    }
    // Si falla o cancela, simplemente no pasa nada — el usuario sigue en Lock
  }

  return (
    <View className="flex-1 justify-center items-center px-6 bg-white gap-4">
      <Text className="text-xl font-bold mb-4">Confirma que eres tú</Text>
     <PatternGrid onComplete={(pattern) => console.log('Patrón dibujado:', pattern)} />
      {biometryAvailable && (
        <Pressable className="bg-blue-600 rounded-lg p-3 w-full" onPress={handleFingerprint}>
          <Text className="text-white text-center font-semibold">
            Usar {biometryType === 'Fingerprint' ? 'huella' : biometryType}
          </Text>
        </Pressable>
      )}

      {/* Simulado todavía: aquí después conectamos el componente de patrón real */}
      <Pressable className="bg-gray-700 rounded-lg p-3 w-full" onPress={unlock}>
        <Text className="text-white text-center font-semibold">Usar patrón</Text>
      </Pressable>

      <Pressable onPress={logout} className="mt-6">
        <Text className="text-gray-500">Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}