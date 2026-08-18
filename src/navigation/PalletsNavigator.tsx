
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '@/features/pallets/screens/HomeScreen';
import { DetailsScreen } from '@/features/pallets/screens/DetailsScreen';
import { SetPatternScreen } from '@/features/auth/screens/SetPatternScreen';

export type PalletsStackParamList = {
  Home: undefined;
  Details: undefined;
  SetPattern: undefined;
};

const Stack = createNativeStackNavigator<PalletsStackParamList>();

export function PalletsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen name="SetPattern" component={SetPatternScreen} options={{ title: 'Configurar patrón' }} />
    </Stack.Navigator>
  );
}