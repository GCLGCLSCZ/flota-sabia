
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { STORAGE_KEYS, getStoredData, setStoredData } from '../storage';

interface CRUDOptions<T> {
  storageKey: string;
  validator?: (data: Partial<T>) => { isValid: boolean; errors: string[] };
  onAdd?: (newItem: T) => void;
  onUpdate?: (id: string, updatedItem: Partial<T>) => void;
}

export function useCRUD<T extends { id: string }>(options: CRUDOptions<T>) {
  const [items, setItems] = useState<T[]>(() => getStoredData(options.storageKey));
  const { toast } = useToast();

  useEffect(() => {
    setStoredData(options.storageKey, items);
  }, [items, options.storageKey]);

  const add = (itemData: Omit<T, "id">): boolean => {
    if (options.validator) {
      const validation = options.validator(itemData);
      if (!validation.isValid) {
        toast({
          title: "Error de validación",
          description: validation.errors.join("\n"),
          variant: "destructive"
        });
        return false;
      }
    }

    const newItem = {
      id: Date.now().toString(),
      ...itemData,
    } as T;

    setItems(prev => [...prev, newItem]);
    
    if (options.onAdd) {
      options.onAdd(newItem);
    }

    toast({
      title: "Elemento agregado",
      description: "El elemento ha sido registrado exitosamente"
    });

    return true;
  };

  const update = (id: string, itemData: Partial<T>) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, ...itemData } : item
      )
    );

    if (options.onUpdate) {
      options.onUpdate(id, itemData);
    }

    toast({
      title: "Elemento actualizado",
      description: "Los datos han sido actualizados exitosamente"
    });
  };

  return {
    items,
    setItems,
    add,
    update
  };
}
