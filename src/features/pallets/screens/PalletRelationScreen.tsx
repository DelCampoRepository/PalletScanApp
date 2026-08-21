import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import IconBarcode from '@tabler/icons-react-native/IconBarcode';
import IconTag from '@tabler/icons-react-native/IconTag';
import IconX from '@tabler/icons-react-native/IconX';
import IconTrash from '@tabler/icons-react-native/IconTrash';
import IconDeviceFloppy from '@tabler/icons-react-native/IconDeviceFloppy';
import IconCheck from '@tabler/icons-react-native/IconCheck';
import { palletRepository } from '@/shared/services/repositoryFactory';
import { BoxLabel, LabelType, PalletInfo } from '@/features/pallets/domain/types';
import { useScannerInput } from '@/features/scanning/hooks/useScannerInput';
import { useRef } from 'react';
const MIN_LABEL_LENGTH = 16;
const MAX_LABEL_LENGTH = 18;

export function PalletRelationScreen() {
    const labelInputRef = useRef<TextInput>(null);
  const [palletCode, setPalletCode] = useState<string | null>(null);
  const [palletInfo, setPalletInfo] = useState<PalletInfo | null>(null);
  const [palletError, setPalletError] = useState<string | null>(null);
  const [scannedLabels, setScannedLabels] = useState<BoxLabel[]>([]);
  const [labelError, setLabelError] = useState<string | null>(null);
  const [relating, setRelating] = useState(false);

  function resetAll() {
    setPalletCode(null);
    setPalletInfo(null);
    setPalletError(null);
    setScannedLabels([]);
    setLabelError(null);
    palletScanner.clear();
    labelScanner.clear();
  }

  async function handlePalletScanned(code: string) {
    setPalletError(null);
    setLabelError(null);

    const info = await palletRepository.getPalletInfo(code);

    if (!info) {
      setPalletError('Pallet inexistente');
      palletScanner.clear();
      return;
    }
    if (info.cancelled) {
      setPalletError('Este pallet está cancelado');
      palletScanner.clear();
      return;
    }
    if (info.requiresConsolidatorPallet) {
      setPalletError(
        `Lea la etiqueta del pallet consolidador: ${info.requiresConsolidatorPallet}`,
      );
      palletScanner.clear();
      return;
    }
    if (info.relatedBoxes >= info.totalBoxes) {
      setPalletError('Este pallet ya está relacionado completamente');
      palletScanner.clear();
      return;
    }

    const existing = await palletRepository.getExistingLabels(code);
    setPalletCode(code);
    setPalletInfo(info);
    setScannedLabels(existing);
    labelInputRef.current?.focus();
  }

  async function handleLabelScanned(code: string) {
    setLabelError(null);

    if (!palletInfo || !palletCode) {
      setLabelError('Escanee un pallet válido primero');
      labelScanner.clear();
      return;
    }
    if (scannedLabels.length >= palletInfo.totalBoxes) {
      setLabelError('Ya se escaneó el total de cajas de la parrilla');
      labelScanner.clear();
      return;
    }
    if (scannedLabels.some((l) => l.code === code)) {
      setLabelError('Esta etiqueta ya está en la lista');
      labelScanner.clear();
      return;
    }

    const type: LabelType = code.slice(0, 2).toUpperCase() === 'C_' ? 'harvestmark' : 'campo';

    if (scannedLabels.length > 0 && scannedLabels[0].type !== type) {
      setLabelError('No puede relacionar etiquetas [Del Campo] con [Harvest Mark] en un pallet');
      labelScanner.clear();
      return;
    }

    const result = await palletRepository.validateLabel(palletCode, code);
    if (!result.ok) {
      setLabelError(result.reason ?? 'Etiqueta no válida');
      labelScanner.clear();
      return;
    }

    setScannedLabels((prev) => [...prev, { code, type, alreadyOnPallet: false }]);
    labelScanner.clear();
  }

  const palletScanner = useScannerInput({
    expectedLengths: [16],
    onComplete: handlePalletScanned,
  });

  const labelScanner = useScannerInput({
    expectedLengths: [MIN_LABEL_LENGTH, MAX_LABEL_LENGTH],
    onComplete: handleLabelScanned,
    disabled: !palletInfo,
  });

  function handleRemoveLabel(code: string) {
    setScannedLabels((prev) => prev.filter((l) => l.code !== code));
  }

  function handleLimpiar() {
    if (scannedLabels.length === 0) return;
    Alert.alert('¿Desea vaciar la lista?', '', [
      { text: 'No', style: 'cancel' },
      { text: 'Sí', onPress: () => setScannedLabels([]) },
    ]);
  }

  async function doRelate() {
    if (!palletCode) return;
    const newLabels = scannedLabels.filter((l) => !l.alreadyOnPallet);
    if (newLabels.length === 0) {
      Alert.alert('No hay etiquetas nuevas para relacionar');
      return;
    }

    setRelating(true);
    const result = await palletRepository.relatePallet(palletCode, newLabels);
    setRelating(false);

    if (result.ok) {
      Alert.alert(
        'Relación finalizada',
        `${scannedLabels.length} de ${palletInfo?.totalBoxes ?? 0} bultos`,
      );
      resetAll();
    }
  }

  function handleRelacionar() {
    if (!palletInfo || !palletCode) {
      Alert.alert('Proporcione un número de pallet para iniciar la relación');
      return;
    }
    if (scannedLabels.length === 0) {
      Alert.alert(
        'Lista vacía, lea el código de barras de las etiquetas pegadas en las cajas del pallet',
      );
      return;
    }
    if (scannedLabels.length < palletInfo.totalBoxes) {
      Alert.alert(
        'No se han leído todas las etiquetas para este pallet',
        '¿Desea continuar?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Sí', onPress: doRelate },
        ],
      );
      return;
    }
    doRelate();
  }

  const progress = palletInfo ? Math.min(1, scannedLabels.length / palletInfo.totalBoxes) : 0;

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="bg-ink px-5 py-4 mb-5">
        <Text className="text-steel text-[11px] tracking-widest uppercase font-mono">
          Validación
        </Text>
        <Text className="text-paper text-lg font-medium mt-1">Relación de pallets</Text>
      </View>

      <View className="px-6">
        <View className="flex-row items-center gap-1.5 mb-1.5">
          <IconBarcode size={14} color="#6E7C74" />
          <Text className="text-steel text-[11px] tracking-wide uppercase">Número de pallet</Text>
        </View>
        <TextInput
          className="bg-ink text-pulp rounded p-3 font-mono text-base tracking-widest text-center"
          value={palletScanner.value}
          onChangeText={palletScanner.handleChangeText}
          onSubmitEditing={palletScanner.handleSubmitEditing}
          maxLength={16}
          editable={!palletInfo}
          autoFocus
        />

        {palletError && <Text className="text-rust text-center mt-2">{palletError}</Text>}

        {palletInfo && (
          <View className="border border-line rounded p-3 mt-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-ink font-medium">{palletInfo.productName}</Text>
              <Pressable onPress={resetAll}>
                <IconX size={16} color="#6E7C74" />
              </Pressable>
            </View>
            <Text className="text-steel text-sm mb-2">GTIN {palletInfo.gtin}</Text>

            <View className="h-2 bg-line rounded overflow-hidden">
              <View
                className="h-2 bg-pulp"
                style={{ width: `${progress * 100}%` }}
              />
            </View>
            <Text className="text-steel text-xs font-mono mt-1">
              {scannedLabels.length} / {palletInfo.totalBoxes} bultos
            </Text>
          </View>
        )}

        {palletInfo && (
          <View className="mt-5">
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <IconTag size={14} color="#6E7C74" />
              <Text className="text-steel text-[11px] tracking-wide uppercase">
                Etiqueta de caja
              </Text>
            </View>
            <TextInput
            ref={labelInputRef}
              className="bg-white border border-line rounded p-3 font-mono text-ink tracking-widest text-center"
              value={labelScanner.value}
              onChangeText={labelScanner.handleChangeText}
              onSubmitEditing={labelScanner.handleSubmitEditing}
              maxLength={MAX_LABEL_LENGTH}
            />
            {labelError && <Text className="text-rust text-center mt-2">{labelError}</Text>}
          </View>
        )}

        {scannedLabels.length > 0 && (
          <View className="mt-5">
            {scannedLabels.map((label) => (
              <View
                key={label.code}
                className="flex-row items-center justify-between border-b border-line py-2.5"
              >
                <View className="flex-row items-center gap-2 flex-1">
                  {label.alreadyOnPallet && <IconCheck size={14} color="#6E7C74" />}
                  <Text className="font-mono text-ink text-xs" numberOfLines={1}>
                    {label.code}
                  </Text>
                </View>
                <Text className="text-steel text-[10px] uppercase mr-3">
                  {label.type === 'harvestmark' ? 'HVM' : 'Campo'}
                </Text>
                {!label.alreadyOnPallet && (
                  <Pressable onPress={() => handleRemoveLabel(label.code)}>
                    <IconX size={16} color="#C1502E" />
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}

        {palletInfo && (
          <View className="flex-row gap-3 mt-5">
            <Pressable
              className="flex-1 flex-row items-center justify-center gap-1.5 border border-steel rounded p-3"
              onPress={handleLimpiar}
            >
              <IconTrash size={16} color="#4B5D55" />
              <Text className="text-steel text-center font-medium">Limpiar</Text>
            </Pressable>
            <Pressable
              className="flex-[1.4] flex-row items-center justify-center gap-2 bg-pulp rounded p-3"
              onPress={handleRelacionar}
              disabled={relating}
            >
              <IconDeviceFloppy size={16} color="#14201A" />
              <Text className="text-ink text-center font-medium">
                {relating ? 'Guardando...' : 'Relacionar'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}