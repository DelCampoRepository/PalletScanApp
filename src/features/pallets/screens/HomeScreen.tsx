import { View, Text, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PalletsStackParamList } from '@/navigation/PalletsNavigator';

type Props = NativeStackScreenProps<PalletsStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold mb-4">Pantalla Home</Text>
      <Pressable
        className="bg-blue-500 px-4 py-2 rounded"
        onPress={() => navigation.navigate('Details')}
      >
        <Text className="text-white font-semibold">Ir a Detalles</Text>
      </Pressable>
      <Pressable
  className="bg-purple-600 px-4 py-2 rounded mt-4"
  onPress={() => navigation.navigate('SetPattern')}
>
  <Text className="text-white font-semibold">Configurar patrón</Text>
</Pressable>
    </View>
  );
}