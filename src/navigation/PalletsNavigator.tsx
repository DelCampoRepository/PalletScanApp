import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { HomeScreen } from '@/features/pallets/screens/HomeScreen';
import { DetailsScreen } from '@/features/pallets/screens/DetailsScreen';
import { EmbarqueScreen } from '@/features/pallets/screens/EmbarquesScreen';
import { SettingsScreen } from '@/features/auth/screens/SettingsScreen';
import { SetPatternScreen } from '@/features/auth/screens/SetPatternScreen';

export type PalletsStackParamList = {
  Home: undefined;
  Details: undefined;
  Embarque: undefined;
  Settings: undefined;
  SetPattern: undefined;
};

const Stack = createNativeStackNavigator<PalletsStackParamList>();

export function PalletsNavigator() {
  const hasRole = useAuthStore((s) => s.hasRole);
  const initialRouteName = hasRole('embarque') ? 'Embarque' : 'Home';

  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      {hasRole('embarque') && <Stack.Screen name="Embarque" component={EmbarqueScreen} />}

      {hasRole('validacion') && (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Details" component={DetailsScreen} />
        </>
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