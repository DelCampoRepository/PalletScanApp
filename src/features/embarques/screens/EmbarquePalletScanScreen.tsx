import { useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import IconBarcode from '@tabler/icons-react-native/IconBarcode';
import IconTruck from '@tabler/icons-react-native/IconTruck';
import IconAlertTriangle from '@tabler/icons-react-native/IconAlertTriangle';
import IconDeviceFloppy from '@tabler/icons-react-native/IconDeviceFloppy';
import IconTrash from '@tabler/icons-react-native/IconTrash';
import { useEmbarqueStore } from '@/features/embarques/store/useEmbarqueStore';
import { embarquePalletRepository } from '@/shared/services/repositoryFactory';
import {
  EmbarquePalletEntry,
  EmbarquePalletInfo,
  TruckPosition,
  TRUCK_POSITION_CODES,
} from '@/features/embarques/domain/types';
import { useScannerInput } from '@/features/scanning/hooks/useScannerInput';

const POSITION_LABELS: { key: TruckPosition; label: string }[] = [
  { key: 'izquierda', label: 'Izquierda' },
  { key: 'centro', label: 'Centro' },
  { key: 'derecha', label: 'Derecha' },
];

function groupPalletsByRow(pallets: EmbarquePalletEntry[]) {
  const rows: Record<number, Partial<Record<TruckPosition, EmbarquePalletEntry>>> = {};
  for (const p of pallets) {
    if (!rows[p.truckRow]) rows[p.truckRow] = {};
    rows[p.truckRow][p.position] = p;
  }
  return Object.entries(rows)
    .map(([row, cells]) => ({ truckRow: Number(row), cells }))
    .sort((a, b) => a.truckRow - b.truckRow);
}

export function EmbarquePalletScanScreen({ navigation }: any) {
  const setupData = useEmbarqueStore((s) => s.setupData);
  const pallets = useEmbarqueStore((s) => s.pallets);
  const addOrUpdatePallet = useEmbarqueStore((s) => s.addOrUpdatePallet);
  const removePallet = useEmbarqueStore((s) => s.removePallet);
  const findPallet = useEmbarqueStore((s) => s.findPallet);
  const resetAll = useEmbarqueStore((s) => s.resetAll);

  const groupedRows = useMemo(() => groupPalletsByRow(pallets), [pallets]);

  const [palletInfo, setPalletInfo] = useState<EmbarquePalletInfo | null>(null);
  const [activePallet, setActivePallet] = useState<string | null>(null);
  const [isExisting, setIsExisting] = useState(false);
  const [truckRow, setTruckRow] = useState('');
  const [position, setPosition] = useState<TruckPosition | null>(null);
  const [isExcess, setIsExcess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const truckRowRef = useRef<TextInput>(null);

  function clearForm() {
    setPalletInfo(null);
    setActivePallet(null);
    setIsExisting(false);
    setTruckRow('');
    setPosition(null);
    setIsExcess(false);
    setErrorMsg(null);
  }

  async function loadFreshPallet(code: string) {
    const info = await embarquePalletRepository.getPalletInfo(code);

    if (!info) {
      setErrorMsg('Pallet inexistente o está cancelado');
      return;
    }
    if (info.status === 'transito') {
      setErrorMsg('Pallet se encuentra en tránsito');
      return;
    }
    if (info.status === 'embarcado') {
      setErrorMsg('Pallet se encuentra embarcado');
      return;
    }
    if (info.relatedBoxesIncomplete && !info.allowsPartialShipment) {
      setErrorMsg(
        'Esta parrilla no se relacionó completamente, comuníquelo a Depto de Etiquetado. No puede embarcarla',
      );
      return;
    }

    const proceedWithPallet = () => {
      setPalletInfo(info);
      setActivePallet(code);
      setIsExisting(false);
      setTruckRow('');
      setPosition(null);
      setIsExcess(false);
      setErrorMsg(null);
      truckRowRef.current?.focus();
    };

    if (info.relatedBoxesIncomplete && info.allowsPartialShipment) {
      Alert.alert(
        'Precaución',
        'Esta parrilla no se relacionó completamente, comuníquelo a Depto de Etiquetado. ¿Desea embarcarla?',
        [
          { text: 'No', style: 'cancel' },
          { text: 'Sí', onPress: proceedWithPallet },
        ],
      );
      return;
    }

    proceedWithPallet();
  }

  async function handlePalletScanned(code: string) {
    setErrorMsg(null);

    const existing = findPallet(code);
    if (existing) {
      setPalletInfo(null);
      setActivePallet(code);
      setIsExisting(true);
      setTruckRow(String(existing.truckRow));
      setPosition(existing.position);
      setIsExcess(existing.isExcess);
      truckRowRef.current?.focus();
      return;
    }

    await loadFreshPallet(code);
  }

  const scanner = useScannerInput({
    expectedLengths: [16],
    onComplete: handlePalletScanned,
  });

  function handleAgregar() {
    if (!activePallet) return;
    if (!truckRow.trim() || Number.isNaN(Number(truckRow))) {
      Alert.alert('Proporcione un número válido para Hilera');
      truckRowRef.current?.focus();
      return;
    }
    if (!position) {
      Alert.alert('Proporcione la posición del pallet en el camión');
      return;
    }

    addOrUpdatePallet({
      noPallet: activePallet,
      truckRow: Number(truckRow),
      position,
      isExcess,
    });

    scanner.clear();
    clearForm();
  }

  function handleQuitar() {
    if (!activePallet) return;
    Alert.alert('¿Desea eliminar este pallet de la lista?', `Pallet: ${activePallet}`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí',
        onPress: () => {
          removePallet(activePallet);
          scanner.clear();
          clearForm();
        },
      },
    ]);
  }

  function handleGuardarEmbarque() {
    if (pallets.length === 0) {
      Alert.alert('Lista vacía, lea el código de barras de los pallets a embarcar');
      return;
    }
    if (!setupData) return;

    Alert.alert('¿Desea guardar embarque?', '', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí',
        onPress: async () => {
          const result = await embarquePalletRepository.saveEmbarque(setupData, pallets);
          if (result.ok) {
            Alert.alert(
              'Embarque guardado',
              `Pallets: ${result.totalPallets}\nEmbarque # ${result.embarqueNumber}`,
            );
            resetAll();
            scanner.clear();
            clearForm();
            navigation.navigate('Embarque');
          }
        },
      },
    ]);
  }

  return (
    <View className="flex-1 bg-paper">
      <View className="bg-ink px-5 py-4">
        <Text className="text-steel text-[11px] tracking-widest uppercase font-mono">
          {setupData?.transportLineName ?? ''} · {setupData?.driverName ?? ''}
        </Text>
        <Text className="text-paper text-lg font-medium mt-1">Escaneo de pallets</Text>
      </View>

      <View className="px-6 pt-5">
        <View className="flex-row items-center gap-1.5 mb-1.5">
          <IconBarcode size={14} color="#6E7C74" />
          <Text className="text-steel text-[11px] tracking-wide uppercase">Número de pallet</Text>
        </View>
        <TextInput
          className="bg-ink text-pulp rounded p-3 font-mono text-base tracking-widest text-center"
          value={scanner.value}
          onChangeText={scanner.handleChangeText}
          onSubmitEditing={scanner.handleSubmitEditing}
          maxLength={16}
          autoFocus
        />

        {errorMsg && <Text className="text-rust text-center mt-2">{errorMsg}</Text>}

        {palletInfo && (
          <View className="border border-line rounded p-3 mt-3">
            <Text className="text-ink font-medium">{palletInfo.productName}</Text>
            <Text className="text-steel text-sm">
              {palletInfo.producerName} · {palletInfo.totalBoxes} bultos
            </Text>
            {palletInfo.isConsolidator && (
              <Text className="text-rust text-xs mt-1">Pallet consolidador</Text>
            )}
          </View>
        )}

        {activePallet && (
          <View className="mt-4">
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <IconTruck size={14} color="#6E7C74" />
              <Text className="text-steel text-[11px] tracking-wide uppercase">
                Hilera del camión
              </Text>
            </View>
            <TextInput
              ref={truckRowRef}
              className="bg-white border border-line rounded p-3 font-mono text-ink"
              value={truckRow}
              onChangeText={setTruckRow}
              keyboardType="number-pad"
            />

            <Text className="text-steel text-[11px] tracking-wide uppercase mt-4 mb-1.5">
              Posición
            </Text>
            <View className="flex-row gap-2">
              {POSITION_LABELS.map(({ key, label }) => (
                <Pressable
                  key={key}
                  onPress={() => setPosition(key)}
                  className={
                    position === key
                      ? 'flex-1 bg-pulp rounded p-2.5'
                      : 'flex-1 border border-steel rounded p-2.5'
                  }
                >
                  <Text
                    className={
                      position === key
                        ? 'text-ink text-center font-medium text-xs'
                        : 'text-steel text-center font-medium text-xs'
                    }
                  >
                    {label} ({TRUCK_POSITION_CODES[key]})
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              className="flex-row items-center gap-2 mt-4"
              onPress={() => setIsExcess((v) => !v)}
            >
              <View
                className={
                  isExcess
                    ? 'w-5 h-5 bg-pulp rounded items-center justify-center'
                    : 'w-5 h-5 border border-steel rounded'
                }
              >
                {isExcess && <IconAlertTriangle size={12} color="#14201A" />}
              </View>
              <Text className="text-ink">Es excedente</Text>
            </Pressable>

            <View className="flex-row gap-3 mt-4">
              {isExisting && (
                <Pressable
                  className="flex-1 flex-row items-center justify-center gap-1.5 border border-rust rounded p-3"
                  onPress={handleQuitar}
                >
                  <IconTrash size={16} color="#C1502E" />
                  <Text className="text-rust text-center font-medium">Quitar</Text>
                </Pressable>
              )}
              <Pressable className="flex-1 bg-steel rounded p-3" onPress={handleAgregar}>
                <Text className="text-paper text-center font-medium">
                  {isExisting ? 'Actualizar' : 'Agregar'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      <View className="h-px bg-line my-4 mx-6" />

      <View className="flex-row justify-between items-center px-6 mb-2">
        <Text className="text-steel text-[11px] tracking-wide uppercase">Pallets en lista</Text>
        <Text className="text-ink font-mono font-medium">{pallets.length}</Text>
      </View>

      <View className="px-6">
        <View className="flex-row border-b border-line pb-2 mb-1">
          <Text className="w-10 text-steel text-[10px] tracking-wide uppercase">Hilera</Text>
          <Text className="flex-1 text-steel text-[10px] tracking-wide uppercase text-center">
            Izq.
          </Text>
          <Text className="flex-1 text-steel text-[10px] tracking-wide uppercase text-center">
            Centro
          </Text>
          <Text className="flex-1 text-steel text-[10px] tracking-wide uppercase text-center">
            Der.
          </Text>
        </View>

        {groupedRows.length === 0 ? (
          <Text className="text-steel text-center py-4">Aún no hay pallets escaneados</Text>
        ) : (
          groupedRows.map(({ truckRow: rowNumber, cells }) => (
            <View key={rowNumber} className="flex-row items-center border-b border-line py-2.5">
              <Text className="w-10 font-mono text-ink text-sm">{rowNumber}</Text>
              {POSITION_LABELS.map(({ key }) => {
                const entry = cells[key];
                return (
                  <Pressable
                    key={key}
                    className="flex-1 items-center"
                    onPress={() => entry && handlePalletScanned(entry.noPallet)}
                  >
                    {entry ? (
                      <View
                        className={
                          entry.isExcess ? 'bg-rust rounded px-2 py-1' : 'bg-ink rounded px-2 py-1'
                        }
                      >
                        <Text className="text-pulp font-mono text-[10px]" numberOfLines={1}>
                          ...{entry.noPallet.slice(-6)}
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-line">—</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))
        )}
      </View>

      <View className="px-6 py-4 mt-2">
        <Pressable
          className="flex-row items-center justify-center gap-2 bg-pulp rounded p-3.5"
          onPress={handleGuardarEmbarque}
        >
          <IconDeviceFloppy size={16} color="#14201A" />
          <Text className="text-ink text-center font-medium">Guardar embarque</Text>
        </Pressable>
      </View>
    </View>
  );
}