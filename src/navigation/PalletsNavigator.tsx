import { Pressable, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { PalletRelationScreen } from '@/features/pallets/screens/PalletRelationScreen';
import { EmbarqueSetupScreen } from '@/features/embarques/screens/EmbarqueSetupScreen';
import { EmbarquePalletScanScreen } from '@/features/embarques/screens/EmbarquePalletScanScreen';
import { SettingsScreen } from '@/features/auth/screens/SettingsScreen';
import { SetPatternScreen } from '@/features/auth/screens/SetPatternScreen';

export type PalletsStackParamList = {
  PalletRelation: undefined;
  Embarque: undefined;
  EmbarquePalletScan: undefined;
  Settings: undefined;
  SetPattern: undefined;
};

const Stack = createNativeStackNavigator<PalletsStackParamList>();

// eslint-disable-next-line react/no-unstable-nested-components
function SettingsButton() {
  const navigation = useNavigation<NativeStackNavigationProp<PalletsStackParamList>>();
  return (
    <Pressable onPress={() => navigation.navigate('Settings')} className="pr-1">
      <Text className="text-2xl">⚙️</Text>
    </Pressable>
  );
}

export function PalletsNavigator() {
  const hasRole = useAuthStore((s) => s.hasRole);
  const initialRouteName = hasRole('embarque') ? 'Embarque' : 'PalletRelation';

  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      {hasRole('embarque') && (
        <Stack.Screen
          name="Embarque"
          component={EmbarqueSetupScreen}
          // eslint-disable-next-line react/no-unstable-nested-components
          options={{ headerRight: () => <SettingsButton /> }}
        />
      )}
      {hasRole('embarque') && (
        <Stack.Screen
          name="EmbarquePalletScan"
          component={EmbarquePalletScanScreen}
          options={{ title: 'Pallets' }}
        />
      )}

      {hasRole('validacion') && (
        <Stack.Screen
          name="PalletRelation"
          component={PalletRelationScreen}
          // eslint-disable-next-line react/no-unstable-nested-components
          options={{ headerRight: () => <SettingsButton /> }}
        />
      )}

      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ajustes' }} />
      <Stack.Screen
        name="SetPattern"
        component={SetPatternScreen}
        options={{ title: 'Configurar patrón' }}
      />
    </Stack.Navigator>
  );
}