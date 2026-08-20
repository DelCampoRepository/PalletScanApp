import { useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import IconBuildingStore from '@tabler/icons-react-native/IconBuildingStore';
import IconMapPin from '@tabler/icons-react-native/IconMapPin';
import IconTemperature from '@tabler/icons-react-native/IconTemperature';
import IconTruck from '@tabler/icons-react-native/IconTruck';
import IconUser from '@tabler/icons-react-native/IconUser';
import IconEngine from '@tabler/icons-react-native/IconEngine';
import IconBox from '@tabler/icons-react-native/IconBox';
import { useEmbarqueStore } from '@/features/embarques/store/useEmbarqueStore';
import { catalogRepository } from '@/shared/services/repositoryFactory';
import { CatalogItem } from '@/features/embarques/domain/ICatalogRepository';
import { useCatalogPicker } from '@/features/embarques/hooks/useCatalogPicker';
import { CatalogPickerModal } from '@/features/embarques/components/CatalogPickerModal';

type IconComponent = React.ComponentType<{ size?: number; color?: string }>;

export function EmbarqueSetupScreen({ navigation }: any) {
  const setupData = useEmbarqueStore((s) => s.setupData);
  const setSetupField = useEmbarqueStore((s) => s.setSetupField);
  const setLocationFromLogin = useEmbarqueStore((s) => s.setLocationFromLogin);
  const resetSetup = useEmbarqueStore((s) => s.resetSetup);

  const picker = useCatalogPicker();

  const temperatureRef = useRef<TextInput>(null);
  const transportLineRef = useRef<TextInput>(null);
  const driverRef = useRef<TextInput>(null);
  const tractorRef = useRef<TextInput>(null);
  const boxRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!setupData?.locationCode) {
      setLocationFromLogin('001', 'CEDIS Culiacán');
    }
  }, [setupData?.locationCode, setLocationFromLogin]);

  const marketCode = setupData?.marketCode ?? '';
  const marketName = setupData?.marketName ?? '';
  const showSaleNumber = marketCode !== '' && marketCode !== '01';

  async function lookupMarket(code: string) {
    const markets = await catalogRepository.getMarkets();
    const found = markets.find((m) => m.code === code);
    setSetupField('marketName', found?.description ?? '');
    if (!found) {
      Alert.alert('Mercado inexistente');
    }
  }

  function handleMarketCodeChange(text: string) {
    setSetupField('marketCode', text);
    if (text.trim().length === 2) {
      lookupMarket(text.trim());
    } else {
      setSetupField('marketName', '');
    }
  }

  async function lookupTransportLine(code: string) {
    const lines = await catalogRepository.getTransportLines();
    const found = lines.find((l) => l.code === code);

    setSetupField('driverCode', '');
    setSetupField('driverName', '');
    setSetupField('tractorCode', '');
    setSetupField('tractorDetail', '');
    setSetupField('boxCode', '');
    setSetupField('boxDetail', '');

    if (!found) {
      setSetupField('transportLineName', '');
      Alert.alert('Línea de transporte no existe o está inactiva');
      return;
    }

    setSetupField('transportLineName', found.description);

    if (code === '099') {
      setSetupField('driverCode', '999');
      setSetupField('driverName', 'Nacional');
      setSetupField('tractorCode', '999');
      setSetupField('tractorDetail', 'Nacional');
      setSetupField('boxCode', '999');
      setSetupField('boxDetail', 'Nacional');
    } else {
      driverRef.current?.focus();
    }
  }

  function handleTransportLineChange(text: string) {
    setSetupField('transportLineCode', text);
    if (text.trim().length === 3) {
      lookupTransportLine(text.trim());
    }
  }

  async function lookupDriver(code: string) {
    if (!setupData?.transportLineCode) {
      Alert.alert('Proporcione línea de transporte para continuar');
      transportLineRef.current?.focus();
      return;
    }
    const drivers = await catalogRepository.getDrivers(setupData.transportLineCode);
    const found = drivers.find((d) => d.code === code);
    setSetupField('driverName', found?.description ?? '');
    if (!found) {
      Alert.alert('Chofer inexistente en línea de transporte o está inactivo');
    } else {
      tractorRef.current?.focus();
    }
  }

  async function lookupTractor(code: string) {
    if (!setupData?.transportLineCode) {
      Alert.alert('Proporcione línea de transporte para continuar');
      transportLineRef.current?.focus();
      return;
    }
    const tractors = await catalogRepository.getTractors(setupData.transportLineCode);
    const found = tractors.find((t) => t.code === code);
    setSetupField('tractorDetail', found?.description ?? '');
    if (!found) {
      Alert.alert('Tractor inexistente en línea de transporte o está inactivo');
    } else {
      boxRef.current?.focus();
    }
  }

  async function lookupBox(code: string) {
    if (!setupData?.transportLineCode) {
      Alert.alert('Proporcione línea de transporte para continuar');
      transportLineRef.current?.focus();
      return;
    }
    const boxes = await catalogRepository.getBoxes(setupData.transportLineCode);
    const found = boxes.find((b) => b.code === code);
    setSetupField('boxDetail', found?.description ?? '');
    if (!found) {
      Alert.alert('Caja inexistente en línea de transporte o está inactiva');
    }
  }

function handleEmbarcar() {
    if (!marketCode || !marketName) {
      Alert.alert('Proporcione mercado existente');
      return;
    }
    if (!setupData?.temperature) {
      Alert.alert('Proporcione temperatura para el embarque');
      temperatureRef.current?.focus();
      return;
    }
    if (!setupData?.transportLineCode || !setupData?.transportLineName) {
      Alert.alert('Proporcione línea de transporte existente');
      transportLineRef.current?.focus();
      return;
    }
    if (!setupData?.driverCode || !setupData?.driverName) {
      Alert.alert('Proporcione chofer existente');
      driverRef.current?.focus();
      return;
    }
    if (!setupData?.tractorCode || !setupData?.tractorDetail) {
      Alert.alert('Proporcione tractor existente');
      tractorRef.current?.focus();
      return;
    }
    if (!setupData?.boxCode || !setupData?.boxDetail) {
      Alert.alert('Proporcione caja existente');
      boxRef.current?.focus();
      return;
    }

    navigation.navigate('EmbarquePalletScan');
  }
  function handleInicializar() {
    Alert.alert('¿Desea inicializar embarque?', '', [
      { text: 'No', style: 'cancel' },
      { text: 'Sí', onPress: () => resetSetup() },
    ]);
  }

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="bg-ink px-5 py-4 mb-5">
        <Text className="text-steel text-[11px] tracking-widest uppercase font-mono">
          Embarque · {setupData?.locationName || '...'}
        </Text>
        <Text className="text-paper text-lg font-medium mt-1">Datos de embarque</Text>
      </View>

      <View className="px-6">
        <FieldWithCatalog
          icon={IconBuildingStore}
          label="Mercado"
          value={marketCode}
          detail={marketName}
          onChangeText={handleMarketCodeChange}
          maxLength={2}
          onPressCatalog={() =>
            picker.open(
              'Mercados',
              () => catalogRepository.getMarkets(),
              (item: CatalogItem) => {
                setSetupField('marketCode', item.code);
                setSetupField('marketName', item.description);
              },
            )
          }
        />

        <ReadOnlyField icon={IconMapPin} label="Ubicación" value={setupData?.locationName ?? ''} />

        {showSaleNumber && (
          <SimpleField
            label="No. Venta"
            value={setupData?.saleNumber ?? ''}
            onChangeText={(v) => setSetupField('saleNumber', v)}
          />
        )}

        <SimpleField
          icon={IconTemperature}
          inputRef={temperatureRef}
          label="Temperatura"
          value={setupData?.temperature ?? ''}
          onChangeText={(v) => setSetupField('temperature', v)}
          onSubmitEditing={() => transportLineRef.current?.focus()}
        />

        <View className="h-px bg-line my-3" />

        <FieldWithCatalog
          icon={IconTruck}
          inputRef={transportLineRef}
          label="Línea de transporte"
          value={setupData?.transportLineCode ?? ''}
          detail={setupData?.transportLineName ?? ''}
          onChangeText={handleTransportLineChange}
          maxLength={3}
          onPressCatalog={() =>
            picker.open(
              'Líneas de transporte',
              () => catalogRepository.getTransportLines(),
              (item: CatalogItem) =>
                lookupTransportLine(item.code).then(() => {
                  setSetupField('transportLineCode', item.code);
                }),
            )
          }
        />

        <FieldWithCatalog
          icon={IconUser}
          inputRef={driverRef}
          label="Chofer"
          value={setupData?.driverCode ?? ''}
          detail={setupData?.driverName ?? ''}
          onChangeText={(v) => {
            setSetupField('driverCode', v);
            if (v.trim().length === 3) lookupDriver(v.trim());
          }}
          maxLength={3}
          onPressCatalog={() =>
            picker.open(
              `Choferes de ${setupData?.transportLineName ?? ''}`,
              () => catalogRepository.getDrivers(setupData?.transportLineCode ?? ''),
              (item: CatalogItem) => {
                setSetupField('driverCode', item.code);
                setSetupField('driverName', item.description);
              },
            )
          }
        />

        <FieldWithCatalog
          icon={IconEngine}
          inputRef={tractorRef}
          label="Tractor"
          value={setupData?.tractorCode ?? ''}
          detail={setupData?.tractorDetail ?? ''}
          onChangeText={(v) => {
            setSetupField('tractorCode', v);
            if (v.trim().length === 3) lookupTractor(v.trim());
          }}
          maxLength={3}
          onPressCatalog={() =>
            picker.open(
              `Tractores de ${setupData?.transportLineName ?? ''}`,
              () => catalogRepository.getTractors(setupData?.transportLineCode ?? ''),
              (item: CatalogItem) => {
                setSetupField('tractorCode', item.code);
                setSetupField('tractorDetail', item.description);
              },
            )
          }
        />

        <FieldWithCatalog
          icon={IconBox}
          inputRef={boxRef}
          label="Caja"
          value={setupData?.boxCode ?? ''}
          detail={setupData?.boxDetail ?? ''}
          onChangeText={(v) => {
            setSetupField('boxCode', v);
            if (v.trim().length === 3) lookupBox(v.trim());
          }}
          maxLength={3}
          onPressCatalog={() =>
            picker.open(
              `Cajas de ${setupData?.transportLineName ?? ''}`,
              () => catalogRepository.getBoxes(setupData?.transportLineCode ?? ''),
              (item: CatalogItem) => {
                setSetupField('boxCode', item.code);
                setSetupField('boxDetail', item.description);
              },
            )
          }
        />

        <View className="flex-row gap-3 mt-4">
          <Pressable
            className="flex-1 border border-steel rounded p-3"
            onPress={handleInicializar}
          >
            <Text className="text-steel text-center font-medium">Inicializar</Text>
          </Pressable>
          <Pressable className="flex-[1.4] bg-pulp rounded p-3" onPress={handleEmbarcar}>
            <Text className="text-ink text-center font-medium">Embarcar</Text>
          </Pressable>
        </View>
      </View>

      <CatalogPickerModal
        visible={picker.visible}
        title={picker.title}
        items={picker.items}
        loading={picker.loading}
        onSelect={picker.handleSelect}
        onClose={picker.close}
      />
    </ScrollView>
  );
}

function FieldLabel({ icon: Icon, label }: { icon?: IconComponent; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5 mb-1.5">
      {Icon ? <Icon size={14} color="#6E7C74" /> : null}
      <Text className="text-steel text-[11px] tracking-wide uppercase">{label}</Text>
    </View>
  );
}

function SimpleField({
  icon,
  label,
  value,
  onChangeText,
  onSubmitEditing,
  inputRef,
}: {
  icon?: IconComponent;
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  onSubmitEditing?: () => void;
  inputRef?: React.Ref<TextInput>;
}) {
  return (
    <View className="mb-4">
      <FieldLabel icon={icon} label={label} />
      <TextInput
        ref={inputRef}
        className="bg-white border border-line rounded p-3 font-mono text-ink"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
}

function ReadOnlyField({
  icon,
  label,
  value,
}: {
  icon?: IconComponent;
  label: string;
  value: string;
}) {
  return (
    <View className="mb-4">
      <FieldLabel icon={icon} label={label} />
      <View className="border border-dashed border-line rounded p-3">
        <Text className="text-steel">{value || '—'}</Text>
      </View>
    </View>
  );
}

function FieldWithCatalog({
  icon,
  label,
  value,
  detail,
  onChangeText,
  onPressCatalog,
  maxLength,
  inputRef,
}: {
  icon?: IconComponent;
  label: string;
  value: string;
  detail: string;
  onChangeText: (v: string) => void;
  onPressCatalog: () => void;
  maxLength: number;
  inputRef?: React.Ref<TextInput>;
}) {
  const filled = value.trim().length > 0;

  return (
    <View className="mb-4">
      <FieldLabel icon={icon} label={label} />
      <View className="flex-row items-center gap-2">
        <TextInput
          ref={inputRef}
          className={
            filled
              ? 'bg-ink text-pulp rounded p-3 w-20 text-center font-mono tracking-widest'
              : 'bg-white border border-dashed border-line text-ink rounded p-3 w-20 text-center font-mono tracking-widest'
          }
          value={value}
          onChangeText={onChangeText}
          maxLength={maxLength}
          keyboardType="number-pad"
        />
        <Pressable className="bg-steel rounded px-4 py-3" onPress={onPressCatalog}>
          <Text className="text-paper font-medium">C</Text>
        </Pressable>
        <Text className="flex-1 text-ink" numberOfLines={1}>
          {detail}
        </Text>
      </View>
    </View>
  );
}