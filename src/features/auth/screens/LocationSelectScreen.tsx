import { View, Text, Pressable } from 'react-native';
import IconMapPin from '@tabler/icons-react-native/IconMapPin';
import { useLocationStore } from '@/shared/store/useLocationStore';
import { LOCATIONS } from '@/shared/config/locations';

export function LocationSelectScreen() {
  const selectLocation = useLocationStore((s) => s.selectLocation);

  return (
    <View className="flex-1 bg-paper">
      <View className="bg-ink px-6 pt-16 pb-10">
        <Text className="text-steel text-[11px] tracking-widest uppercase font-mono">
          Configuración inicial
        </Text>
        <Text className="text-paper text-2xl font-medium mt-1">Selecciona tu ubicación</Text>
      </View>

      <View className="px-6 pt-6 gap-3">
        {LOCATIONS.map((location) => (
          <Pressable
            key={location.code}
            className="flex-row items-center gap-3 bg-white border border-line rounded p-4"
            onPress={() => selectLocation(location.code)}
          >
            <IconMapPin size={18} color="#6E7C74" />
            <Text className="text-ink font-medium flex-1">{location.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}