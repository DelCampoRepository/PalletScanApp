import { useCallback, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import IconFingerprint from '@tabler/icons-react-native/IconFingerprint';
import IconGridDots from '@tabler/icons-react-native/IconGridDots';
import IconCheck from '@tabler/icons-react-native/IconCheck';
import IconShieldLock from '@tabler/icons-react-native/IconShieldLock';
import { isSensorAvailable } from '@sbaiahmed1/react-native-biometrics';
import { hasPatternConfigured } from '@/features/auth/services/patternService';
import IconLogout from '@tabler/icons-react-native/IconLogout';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

import {
  getPreferredMethod,
  setPreferredMethod,
  type AuthMethod,
} from '@/features/auth/services/authPreferenceService';

export function SettingsScreen({ navigation }: any) {
  const logout = useAuthStore((s) => s.logout);
  const [biometryAvailable, setBiometryAvailable] = useState(false);
  const [patternConfigured, setPatternConfigured] = useState(false);
  const [preferredMethod, setPreferredMethodState] = useState<AuthMethod | null>(null);

  const loadState = useCallback(() => {
    isSensorAvailable().then((info) => setBiometryAvailable(info.available));
    hasPatternConfigured().then(setPatternConfigured);
    getPreferredMethod().then(setPreferredMethodState);
  }, []);

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
    <View className="flex-1 bg-paper">
      <View className="bg-ink px-5 py-4">
        <Text className="text-steel text-[11px] tracking-widest uppercase font-mono">
          Cuenta
        </Text>
        <Text className="text-paper text-lg font-medium mt-1">Ajustes</Text>
      </View>

      <View className="px-6 pt-6 gap-8">
        <View className="gap-2">
          <Text className="text-steel text-[11px] tracking-wide uppercase mb-1">
            Método preferido
          </Text>
          <Text className="text-steel text-sm mb-2">
            Se usa primero al reabrir la app. El otro método sigue disponible como respaldo.
          </Text>

          <MethodRow
            icon={IconFingerprint}
            label="Huella"
            available={biometryAvailable}
            unavailableHint="no disponible"
            selected={preferredMethod === 'fingerprint'}
            onPress={() => choosePreferred('fingerprint')}
          />

          <MethodRow
            icon={IconGridDots}
            label="Patrón"
            available={patternConfigured}
            unavailableHint="sin configurar"
            selected={preferredMethod === 'pattern'}
            onPress={() => choosePreferred('pattern')}
          />
        </View>

        <View className="gap-2">
          <Text className="text-steel text-[11px] tracking-wide uppercase mb-1">
            Patrón de desbloqueo
          </Text>
          <Pressable
            className="flex-row items-center justify-center gap-2 bg-steel rounded p-3"
            onPress={() => navigation.navigate('SetPattern')}
          >
            <IconShieldLock size={16} color="#F3F1E7" />
            <Text className="text-paper text-center font-medium">
              {patternConfigured ? 'Cambiar patrón' : 'Configurar patrón'}
            </Text>
          </Pressable>
        </View>
      </View>
      <View className="gap-2">
  <Pressable
    className="flex-row items-center justify-center gap-2 border border-rust rounded p-3"
    onPress={logout}
  >
    <IconLogout size={16} color="#C1502E" />
    <Text className="text-rust text-center font-medium">Cerrar sesión</Text>
  </Pressable>
</View>
    </View>
  );
}

function MethodRow({
  icon: Icon,
  label,
  available,
  unavailableHint,
  selected,
  onPress,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  available: boolean;
  unavailableHint: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={!available}
      onPress={onPress}
      className={
        selected
          ? 'bg-ink rounded p-3 flex-row items-center justify-between'
          : available
            ? 'bg-white border border-line rounded p-3 flex-row items-center justify-between'
            : 'border border-dashed border-line rounded p-3 flex-row items-center justify-between opacity-50'
      }
    >
      <View className="flex-row items-center gap-2">
        <Icon size={16} color={selected ? '#C7D93E' : '#6E7C74'} />
        <Text className={selected ? 'text-paper' : 'text-ink'}>
          {label}
          {!available ? ` (${unavailableHint})` : ''}
        </Text>
      </View>
      {selected && <IconCheck size={16} color="#C7D93E" />}
    </Pressable>
  );
}