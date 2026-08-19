import { View, Text } from 'react-native';

export function EmbarqueScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold">Pantalla de Embarque</Text>
      <Text className="text-gray-500 mt-2">Aquí va el flujo de escaneo para embarcar</Text>
    </View>
  );
}