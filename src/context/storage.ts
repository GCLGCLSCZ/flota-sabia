
export const STORAGE_KEYS = {
  VEHICLES: 'app_vehicles',
  PAYMENTS: 'app_payments',
  INVESTORS: 'app_investors',
  DRIVERS: 'app_drivers',
  MAINTENANCE: 'app_maintenance',
  CARDEX: 'app_cardex',
  DISCOUNTS: 'app_discounts',
  SETTINGS: 'app_settings',
  FREE_DAYS: 'app_free_days',
  DAYS_NOT_WORKED: 'app_days_not_worked'
};

export const getStoredData = <T>(key: string): T[] => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error(`Error obteniendo datos de ${key}:`, error);
    return [];
  }
};

export const setStoredData = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error guardando datos en ${key}:`, error);
  }
};

export const removeStoredData = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error eliminando datos de ${key}:`, error);
  }
};

export const clearAllStoredData = (): void => {
  console.log("Ejecutando limpieza completa de datos almacenados");
  
  try {
    // Primera pasada: Limpiar todas las claves definidas en STORAGE_KEYS
    Object.values(STORAGE_KEYS).forEach(key => {
      console.log(`Eliminando clave conocida: ${key}`);
      removeStoredData(key);
    });
    
    // Segunda pasada: Buscar y limpiar otras claves que empiecen con app_
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('app_')) {
        keysToRemove.push(key);
      }
    }
    
    // Eliminar las claves encontradas
    keysToRemove.forEach(key => {
      console.log(`Eliminando clave adicional: ${key}`);
      removeStoredData(key);
    });
    
    // También limpiamos settings si existe
    removeStoredData('settings');
    
    console.log("Limpieza de datos completada");
  } catch (error) {
    console.error("Error durante la limpieza de datos:", error);
  }
};
