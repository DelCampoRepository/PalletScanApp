import { Pressable, Text } from 'react-native';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { HomeScreen } from '@/features/pallets/screens/HomeScreen';
import { DetailsScreen } from '@/features/pallets/screens/DetailsScreen';//import { EmbarqueScreen } from '@/features/pallets/screens/EmbarquesScreen';
import { SettingsScreen } from '@/features/auth/screens/SettingsScreen';
import { SetPatternScreen } from '@/features/auth/screens/SetPatternScreen';
import { EmbarqueSetupScreen } from '@/features/embarques/screens/EmbarqueSetupScreen';
import { EmbarquePalletScanScreen } from '@/features/embarques/screens/EmbarquePalletScanScreen';

import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator, type NativeStackNavigationProp } from '@react-navigation/native-stack';


export type PalletsStackParamList = {
 Home: undefined;
  Details: undefined;
  Embarque: undefined;
  EmbarquePalletScan: undefined;
  Settings: undefined;
  SetPattern: undefined;
};

const Stack = createNativeStackNavigator<PalletsStackParamList>();

// Ya no recibe `navigation` por props — lo obtiene solo con el hook,
// así el `options` de cada pantalla puede ser un objeto estático
// en vez de una función que captura variables del render.
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
  const initialRouteName = hasRole('embarque') ? 'Embarque' : 'Home';

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

      {hasRole('validacion') && (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            // eslint-disable-next-line react/no-unstable-nested-components
            options={{ headerRight: () => <SettingsButton /> }}
          />
          <Stack.Screen name="Details" component={DetailsScreen} />
        </>
      )}

      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ajustes' }} />
      <Stack.Screen
        name="SetPattern"
        component={SetPatternScreen}
        options={{ title: 'Configurar patrón' }}
      />
      <Stack.Screen name="EmbarquePalletScan" component={EmbarquePalletScanScreen} options={{ title: 'Pallets' }} />
    </Stack.Navigator>
  );
}