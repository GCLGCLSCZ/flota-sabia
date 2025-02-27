
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { STORAGE_KEYS, getStoredData, setStoredData } from '../storage';

interface CRUDOptions<T> {
  storageKey: string;
  validator?: (data: Partial<T>) => { isValid: boolean; errors: string[] };
  onAdd?: (newItem: T) => void;
  onUpdate?: (id: string, updatedItem: Partial<T>) => void;
  onDelete?: (id: string) => void;
}

export function useCRUD<T extends { id: string }>(options: CRUDOptions<T>) {
  const [items, setItems] = useState<T[]>(() => getStoredData(options.storageKey));
  const { toast } = useToast();

  useEffect(() => {
    setStoredData(options.storageKey, items);
  }, [items, options.storageKey]);

  const add = (itemData: Omit<T, "id">) => {
    if (options.validator) {
      const validation = options.validator(itemData as Partial<T>);
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
      ...itemData,
      id: Date.now().toString(),
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

    return true;
  };

  const remove = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));

    if (options.onDelete) {
      options.onDelete(id);
    }

    toast({
      title: "Elemento eliminado",
      description: "El elemento ha sido eliminado exitosamente"
    });

    return true;
  };

  return {
    items,
    setItems,
    add,
    update,
    remove
  };
}
