import {useState} from 'react'
import {View, Text, Alert} from 'react-native';
import { PatternGrid } from '@/features/auth/components/PatternGrid';
import { savePattern } from '@/features/auth/services/patternService';

const MIN_PATTERN_LENGTH = 4;

type Step ='draw' | 'confirm';

export function SetPatternScreen({navigation}: any){
    const [step, setStep] = useState<Step>('draw');
    const [firstPattern, setFirstPattern]= useState<number[] | null>(null);
    const [resetKey, setResetKey] = useState(0);
    const [error, setError] = useState<string | null>(null);

      function handleComplete(pattern: number[]) {
    setError(null);

    if (pattern.length < MIN_PATTERN_LENGTH) {
      setError(`Conecta al menos ${MIN_PATTERN_LENGTH} puntos`);
      setResetKey((k) => k + 1);
      return;
    }

    if (step === 'draw') {
      setFirstPattern(pattern);
      setStep('confirm');
      setResetKey((k) => k + 1);
      return;
    }

    // step === 'confirm'
    const matches =
      firstPattern !== null &&
      pattern.length === firstPattern.length &&
      pattern.every((id, i) => id === firstPattern[i]);

    if (!matches) {
      setError('Los patrones no coinciden, intenta de nuevo');
      setStep('draw');
      setFirstPattern(null);
      setResetKey((k) => k + 1);
      return;
    }

    savePattern(pattern).then(() => {
      Alert.alert('Listo', 'Tu patrón quedó configurado');
      navigation.goBack();
    });
  }

    return (
    <View className="flex-1 items-center justify-center bg-white px-6 gap-4">
      <Text className="text-xl font-bold">
        {step === 'draw' ? 'Dibuja tu patrón' : 'Confirma tu patrón'}
      </Text>
      <Text className="text-gray-500 text-center">
        {step === 'draw'
          ? `Conecta al menos ${MIN_PATTERN_LENGTH} puntos`
          : 'Dibújalo de nuevo para confirmar'}
      </Text>

      <PatternGrid key={resetKey} onComplete={handleComplete} />

      {error && <Text className="text-red-600 text-center">{error}</Text>}
    </View>
  );
}