import { View, Text, Pressable } from 'react-native';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export function LockScreen() {
  const unlock = useAuthStore((s) => s.unlock);
  const logout = useAuthStore((s) => s.logout);

  return (
    <View className="flex-1 justify-center items-center px-6 bg-white gap-4">
      <Text className="text-xl font-bold mb-4">Confirma que eres tú</Text>

      {/* Simulado: aquí después conectamos react-native-biometrics */}
      <Pressable className="bg-blue-600 rounded-lg p-3 w-full" onPress={unlock}>
        <Text className="text-white text-center font-semibold">Usar huella</Text>
      </Pressable>

      {/* Simulado: aquí después conectamos el componente de patrón */}
      <Pressable className="bg-gray-700 rounded-lg p-3 w-full" onPress={unlock}>
        <Text className="text-white text-center font-semibold">Usar patrón</Text>
      </Pressable>

      <Pressable onPress={logout} className="mt-6">
        <Text className="text-gray-500">Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}