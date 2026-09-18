import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import IconUser from '@tabler/icons-react-native/IconUser';
import IconLock from '@tabler/icons-react-native/IconLock';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import type { UserRole } from '@/features/auth/domain/types';

export function LoginScreen() {
  const [role, setRole] = useState<UserRole>('embarque');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const loginWithPassword = useAuthStore((s) => s.loginWithPassword);
  const error = useAuthStore((s) => s.error);

  async function handleSubmit() {
    setSubmitting(true);
    await loginWithPassword(username, password, role);
    setSubmitting(false);
  }

  return (
    <View className="flex-1 bg-paper">
      <View className="bg-ink px-6 pt-16 pb-10">
        <Text className="text-steel text-[11px] tracking-widest uppercase font-mono">
          Sistema de embarques
        </Text>
        <Text className="text-paper text-2xl font-medium mt-1">Iniciar sesión</Text>
      </View>

      <View className="px-6 pt-6">
        <View className="flex-row bg-white border border-line rounded overflow-hidden mb-6">
          <Pressable
            className={role === 'embarque' ? 'flex-1 bg-ink p-3' : 'flex-1 p-3'}
            onPress={() => setRole('embarque')}
          >
            <Text
              className={
                role === 'embarque'
                  ? 'text-pulp text-center font-medium'
                  : 'text-steel text-center font-medium'
              }
            >
              Embarque
            </Text>
          </Pressable>
          <Pressable
            className={role === 'validacion' ? 'flex-1 bg-ink p-3' : 'flex-1 p-3'}
            onPress={() => setRole('validacion')}
          >
            <Text
              className={
                role === 'validacion'
                  ? 'text-pulp text-center font-medium'
                  : 'text-steel text-center font-medium'
              }
            >
              Validación
            </Text>
          </Pressable>
        </View>

        <View className="flex-row items-center gap-1.5 mb-1.5">
          <IconUser size={14} color="#6E7C74" />
          <Text className="text-steel text-[11px] tracking-wide uppercase">Usuario</Text>
        </View>
        <TextInput
          className="bg-white border border-line rounded p-3 font-mono text-ink mb-4"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

        <View className="flex-row items-center gap-1.5 mb-1.5">
          <IconLock size={14} color="#6E7C74" />
          <Text className="text-steel text-[11px] tracking-wide uppercase">Contraseña</Text>
        </View>
        <TextInput
          className="bg-white border border-line rounded p-3 font-mono text-ink mb-2"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text className="text-rust text-center mb-2">{error}</Text> : null}

        <Pressable className="bg-pulp rounded p-3.5 mt-3" disabled={submitting} onPress={handleSubmit}>
          <Text className="text-ink text-center font-medium">
            {submitting ? 'Ingresando...' : 'Ingresar'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}