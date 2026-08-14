import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const loginWithPassword = useAuthStore((s) => s.loginWithPassword);
  const error = useAuthStore((s) => s.error);

  return (
    <View className="flex-1 justify-center px-6 bg-white gap-3">
      <Text className="text-2xl font-bold text-center mb-6">Relación de pallets</Text>

      <TextInput
        className="border border-gray-300 rounded-lg p-3"
        placeholder="Usuario"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        className="border border-gray-300 rounded-lg p-3"
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text className="text-red-600 text-center">{error}</Text> : null}

      <Pressable
        className="bg-blue-600 rounded-lg p-3 mt-2"
        onPress={() => loginWithPassword(username, password)}
      >
        <Text className="text-white text-center font-semibold">Ingresar</Text>
      </Pressable>
    </View>
  );
}