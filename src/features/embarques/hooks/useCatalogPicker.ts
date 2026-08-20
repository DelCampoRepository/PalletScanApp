import { useCallback, useState } from 'react';
import { CatalogItem } from '@/features/embarques/domain/ICatalogRepository';

// Maneja "cuál catálogo está abierto ahora" sin que la pantalla tenga
// que repetir 5 veces el mismo estado (visible/items/loading) para
// mercado, línea, chofer, tractor y caja.
export function useCatalogPicker() {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [onSelectCallback, setOnSelectCallback] = useState<((item: CatalogItem) => void) | null>(
    null,
  );

  const open = useCallback(
    async (
      pickerTitle: string,
      loader: () => Promise<CatalogItem[]>,
      onSelect: (item: CatalogItem) => void,
    ) => {
      setTitle(pickerTitle);
      setVisible(true);
      setLoading(true);
      setOnSelectCallback(() => onSelect);
      const result = await loader();
      setItems(result);
      setLoading(false);
    },
    [],
  );

  const close = useCallback(() => setVisible(false), []);

  const handleSelect = useCallback(
    (item: CatalogItem) => {
      onSelectCallback?.(item);
      setVisible(false);
    },
    [onSelectCallback],
  );

  return { visible, title, items, loading, open, close, handleSelect };
}