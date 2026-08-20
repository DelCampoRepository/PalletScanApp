import { Modal, View, Text, FlatList, Pressable } from 'react-native';
import { CatalogItem } from '@/features/embarques/domain/ICatalogRepository';

interface CatalogPickerModalProps {
  visible: boolean;
  title: string;
  items: CatalogItem[];
  loading?: boolean;
  onSelect: (item: CatalogItem) => void;
  onClose: () => void;
}

// Reemplaza el FrmCatalogo genérico del VB.NET (el DataGrid compartido
// que usaban los 5 botones "C"). No sabe nada de mercados, choferes,
// etc. — solo recibe una lista y avisa qué se tocó.
export function CatalogPickerModal({
  visible,
  title,
  items,
  loading,
  onSelect,
  onClose,
}: CatalogPickerModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-2xl max-h-[70%]">
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
              renderItem={({ item }) => (
                <Pressable className="p-4 border-b border-gray-100" onPress={() => onSelect(item)}>
                  <Text className="font-semibold">{item.code}</Text>
                  <Text className="text-gray-600">{item.description}</Text>
                </Pressable>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}