
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '@/features/pallets/screens/HomeScreen';
import { DetailsScreen } from '@/features/pallets/screens/DetailsScreen';

export type PalletsStackParamList = {
  Home: undefined;
  Details: undefined;
};

const Stack = createNativeStackNavigator<PalletsStackParamList>();

export function PalletsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
}