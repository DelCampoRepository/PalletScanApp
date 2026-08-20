import { useCallback, useState } from 'react';

interface UseScannerInputOptions {
  expectedLengths: number[];
  onComplete: (code: string) => void;
  disabled?: boolean;
}

// Reemplaza la lógica que en el sistema original vivía repetida en cada
// txtNo_pallet_TextChanged: el escáner (modo "keyboard wedge") escribe el
// código como si fuera un teclado y dispara Enter al final.
export function useScannerInput({ expectedLengths, onComplete, disabled }: UseScannerInputOptions) {
  const [value, setValue] = useState('');

  const handleChangeText = useCallback(
    (text: string) => {
      setValue(text);
      if (disabled) return;
      const trimmed = text.trim();
      if (expectedLengths.includes(trimmed.length)) {
        onComplete(trimmed);
      }
    },
    [expectedLengths, onComplete, disabled],
  );

  const handleSubmitEditing = useCallback(() => {
    if (disabled) return;
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      onComplete(trimmed);
    }
  }, [value, onComplete, disabled]);

  const clear = useCallback(() => setValue(''), []);

  return { value, setValue, handleChangeText, handleSubmitEditing, clear };
}