import { Modal, View, Text, Pressable } from 'react-native';
import IconWifiOff from '@tabler/icons-react-native/IconWifiOff';
import { useNetworkErrorStore } from '@/shared/store/useNetworkErrorStore';

export function NetworkErrorModal() {
  const visible = useNetworkErrorStore((s) => s.visible);
  const message = useNetworkErrorStore((s) => s.message);
  const hide = useNetworkErrorStore((s) => s.hide);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={hide}>
      <View className="flex-1 bg-black/40 justify-center items-center px-8">
        <View className="bg-white rounded-2xl w-full p-6 items-center gap-3">
          <IconWifiOff size={32} color="#C1502E" />
          <Text className="text-ink text-lg font-medium text-center">Sin conexión</Text>
          <Text className="text-steel text-center">{message}</Text>
          <Pressable className="bg-pulp rounded p-3 w-full mt-2" onPress={hide}>
            <Text className="text-ink text-center font-medium">Entendido</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}