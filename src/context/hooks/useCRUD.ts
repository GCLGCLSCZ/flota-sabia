
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { STORAGE_KEYS, getStoredData, setStoredData } from '../storage';
import { supabase } from '@/lib/supabase';

interface CRUDOptions<T> {
  storageKey: string;
  tableName?: string; // Nombre de la tabla en Supabase
  validator?: (data: Partial<T>) => { isValid: boolean; errors: string[] };
  onAdd?: (newItem: T) => void;
  onUpdate?: (id: string, updatedItem: Partial<T>) => void;
  onDelete?: (id: string) => void;
  useSupabase?: boolean; // Flag para determinar si usar Supabase o localStorage
  transformToDb?: (item: Partial<T>) => any; // Transformar de modelo a formato DB
  transformFromDb?: (dbItem: any) => Partial<T>; // Transformar de DB a modelo
}

export function useCRUD<T extends { id: string }>(options: CRUDOptions<T>) {
  const [items, setItems] = useState<T[]>(() => getStoredData(options.storageKey));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Verificamos si realmente podemos usar Supabase
  const canUseSupabase = options.useSupabase && supabase && options.tableName;

  // Carga inicial de datos
  useEffect(() => {
    if (canUseSupabase) {
      fetchItems();
    }
  }, [canUseSupabase]);

  // Cuando usamos localStorage, sincronizamos los cambios
  useEffect(() => {
    if (!canUseSupabase) {
      setStoredData(options.storageKey, items);
    }
  }, [items, options.storageKey, canUseSupabase]);

  // Función para obtener los datos de Supabase
  const fetchItems = useCallback(async () => {
    if (!canUseSupabase) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from(options.tableName)
        .select('*');

      if (error) {
        throw error;
      }

      // Transformar datos si es necesario
      const transformedData = options.transformFromDb 
        ? data.map(item => options.transformFromDb!(item) as T)
        : data as unknown as T[];

      setItems(transformedData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
      console.error('Error fetching data:', err);
      toast({
        title: "Error de carga",
        description: `No se pudieron cargar los datos: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [options.tableName, canUseSupabase, options.transformFromDb, toast]);

  // Añadir un nuevo elemento
  const add = async (itemData: Omit<T, "id">) => {
    // Validar datos si hay un validador
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

    // Si usamos Supabase
    if (canUseSupabase) {
      setLoading(true);

      try {
        // Transformar datos para Supabase si es necesario
        const dbData = options.transformToDb 
          ? options.transformToDb(itemData as Partial<T>)
          : itemData;

        // Insertar en Supabase
        const { data, error } = await supabase
          .from(options.tableName)
          .insert(dbData)
          .select();

        if (error) {
          throw error;
        }

        // Transformar la respuesta si es necesario
        const newItem = options.transformFromDb 
          ? options.transformFromDb(data[0]) as T
          : data[0] as unknown as T;

        setItems(prev => [...prev, newItem]);
        
        if (options.onAdd) {
          options.onAdd(newItem);
        }

        toast({
          title: "Elemento agregado",
          description: "El elemento ha sido registrado exitosamente"
        });

        return true;
      } catch (err: any) {
        setError(err.message || 'Error al agregar');
        console.error('Error adding data:', err);
        toast({
          title: "Error al agregar",
          description: `No se pudo agregar el elemento: ${err.message}`,
          variant: "destructive"
        });
        return false;
      } finally {
        setLoading(false);
      }
    } else {
      // Si usamos localStorage (comportamiento original)
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
    }
  };

  // Actualizar un elemento existente
  const update = async (id: string, itemData: Partial<T>) => {
    // Validar datos si hay un validador
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

    // Si usamos Supabase
    if (canUseSupabase) {
      setLoading(true);

      try {
        // Transformar datos para Supabase si es necesario
        const dbData = options.transformToDb 
          ? options.transformToDb(itemData)
          : itemData;

        // Actualizar en Supabase
        const { data, error } = await supabase
          .from(options.tableName)
          .update(dbData)
          .eq('id', id)
          .select();

        if (error) {
          throw error;
        }

        // Actualizar estado local
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
      } catch (err: any) {
        setError(err.message || 'Error al actualizar');
        console.error('Error updating data:', err);
        toast({
          title: "Error al actualizar",
          description: `No se pudo actualizar el elemento: ${err.message}`,
          variant: "destructive"
        });
        return false;
      } finally {
        setLoading(false);
      }
    } else {
      // Si usamos localStorage (comportamiento original)
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
    }
  };

  // Eliminar un elemento
  const remove = async (id: string) => {
    // Si usamos Supabase
    if (canUseSupabase) {
      setLoading(true);

      try {
        // Eliminar de Supabase
        const { error } = await supabase
          .from(options.tableName)
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        // Actualizar estado local
        setItems(prevItems => prevItems.filter(item => item.id !== id));

        if (options.onDelete) {
          options.onDelete(id);
        }

        toast({
          title: "Elemento eliminado",
          description: "El elemento ha sido eliminado exitosamente"
        });

        return true;
      } catch (err: any) {
        setError(err.message || 'Error al eliminar');
        console.error('Error deleting data:', err);
        toast({
          title: "Error al eliminar",
          description: `No se pudo eliminar el elemento: ${err.message}`,
          variant: "destructive"
        });
        return false;
      } finally {
        setLoading(false);
      }
    } else {
      // Si usamos localStorage (comportamiento original)
      setItems(prevItems => prevItems.filter(item => item.id !== id));

      if (options.onDelete) {
        options.onDelete(id);
      }

      toast({
        title: "Elemento eliminado",
        description: "El elemento ha sido eliminado exitosamente"
      });

      return true;
    }
  };

  return {
    items,
    setItems,
    add,
    update,
    remove,
    loading,
    error,
    refresh: fetchItems
  };
}
