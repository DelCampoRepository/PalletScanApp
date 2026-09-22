import { Modal, View, Text, FlatList, Pressable } from 'react-native';
import { CatalogItem } from '@/features/embarques/domain/ICatalogRepository';

interface CatalogPickerModalProps {
  visible: boolean;
  title: string;
  items: CatalogItem[];
  loading?: boolean;
  onSelect: (item: CatalogItem) => void;
  onClose: () => void;
  isItemDisabled?: (item: CatalogItem) => boolean;
  disabledReason?: string;
}

export function CatalogPickerModal({
  visible,
  title,
  items,
  loading,
  onSelect,
  onClose,
  isItemDisabled,
  disabledReason,
}: CatalogPickerModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/40 justify-center items-center px-6">
        <View className="bg-white rounded-2xl w-full max-h-[70%]">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-lg font-bold">{title}</Text>
            <Pressable onPress={onClose}>
              <Text className="text-blue-600 font-semibold">Cerrar</Text>
            </Pressable>
          </View>

          {loading ? (
            <Text className="p-6 text-center text-gray-500">Cargando...</Text>
          ) : items.length === 0 ? (
            <Text className="p-6 text-center text-gray-500">Sin resultados</Text>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => {
                const disabled = isItemDisabled?.(item) ?? false;
                return (
                  <Pressable
                    className={disabled ? 'p-4 border-b border-gray-100 opacity-40' : 'p-4 border-b border-gray-100'}
                    disabled={disabled}
                    onPress={() => onSelect(item)}
                  >
                    <Text className="font-semibold">{item.code}</Text>
                    <Text className="text-gray-600">{item.description}</Text>
                    {disabled && disabledReason && (
                      <Text className="text-rust text-xs mt-1">{disabledReason}</Text>
                    )}
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}