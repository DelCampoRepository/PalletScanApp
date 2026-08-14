import { View, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PalletsStackParamList } from '@/navigation/PalletsNavigator';

type Props = NativeStackScreenProps<PalletsStackParamList, 'Details'>;

export function DetailsScreen(_props: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold">Pantalla Details</Text>
    </View>
  );
}