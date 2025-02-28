
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
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

export const setStoredData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const clearAllStoredData = (): void => {
  // Limpiar todas las claves definidas
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  
  // También buscar y limpiar otras claves que empiecen con app_
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('app_')) {
      localStorage.removeItem(key);
    }
  }
};
