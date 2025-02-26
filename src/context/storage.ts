
export const STORAGE_KEYS = {
  VEHICLES: 'app_vehicles',
  PAYMENTS: 'app_payments',
  INVESTORS: 'app_investors',
  DRIVERS: 'app_drivers',
};

export const getStoredData = <T>(key: string): T[] => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

export const setStoredData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};
