
import { createContext, useContext, ReactNode } from "react";
import { Vehicle, Payment, Investor, Driver, SystemSettings } from "@/types";
import { STORAGE_KEYS } from "./storage";
import { validateVehicleData, validateInvestorData, validateDriverData } from "./validators";
import { useCRUD } from "./hooks/useCRUD";

interface AppContextType {
  vehicles: Vehicle[];
  setVehicles: (vehicles: Vehicle[]) => void;
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  investors: Investor[];
  setInvestors: (investors: Investor[]) => void;
  drivers: Driver[];
  setDrivers: (drivers: Driver[]) => void;
  settings: SystemSettings;
  updateSettings: (settings: Partial<SystemSettings>) => void;
  addVehicle: (vehicle: Omit<Vehicle, "id">) => boolean;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => boolean;
  addPayment: (payment: Omit<Payment, "id">) => boolean;
  updatePayment: (id: string, payment: Partial<Payment>) => boolean;
  removePayment: (id: string) => boolean;
  addInvestor: (investor: Omit<Investor, "id">) => boolean;
  updateInvestor: (id: string, investor: Partial<Investor>) => boolean;
  addDriver: (driver: Omit<Driver, "id">) => boolean;
  updateDriver: (id: string, driver: Partial<Driver>) => boolean;
  validateVehicleData: (vehicle: Partial<Vehicle>) => { isValid: boolean; errors: string[] };
  validateInvestorData: (investor: Partial<Investor>) => { isValid: boolean; errors: string[] };
  validateDriverData: (driver: Partial<Driver>) => { isValid: boolean; errors: string[] };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Definir la configuración por defecto del sistema
const DEFAULT_SETTINGS: Omit<SystemSettings, "id"> = {
  gpsMonthlyFee: 120,
  currency: "bs",
  dateFormat: "dd/MM/yyyy",
  timezone: "la_paz"
};

export function AppProvider({ children }: { children: ReactNode }) {
  const {
    items: vehicles,
    setItems: setVehicles,
    add: addVehicle,
    update: updateVehicle
  } = useCRUD<Vehicle>({
    storageKey: STORAGE_KEYS.VEHICLES,
    validator: validateVehicleData
  });

  const {
    items: payments,
    setItems: setPayments,
    add: addPayment,
    update: updatePayment,
    remove: removePayment
  } = useCRUD<Payment>({
    storageKey: STORAGE_KEYS.PAYMENTS
  });

  const {
    items: investors,
    setItems: setInvestors,
    add: addInvestor,
    update: updateInvestor
  } = useCRUD<Investor>({
    storageKey: STORAGE_KEYS.INVESTORS,
    validator: validateInvestorData
  });

  const {
    items: drivers,
    setItems: setDrivers,
    add: addDriver,
    update: updateDriver
  } = useCRUD<Driver>({
    storageKey: STORAGE_KEYS.DRIVERS,
    validator: validateDriverData
  });

  // Gestión de la configuración del sistema
  const {
    items: settingsArray,
    setItems: setSettingsArray,
    add: addSettings
  } = useCRUD<SystemSettings>({
    storageKey: 'settings'
  });

  // Asegurarse de que siempre haya una configuración disponible
  const settings = settingsArray.length > 0 ? settingsArray[0] : {
    id: 'default-settings',
    ...DEFAULT_SETTINGS
  };

  // Función para actualizar la configuración
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    if (settingsArray.length > 0) {
      setSettingsArray([updatedSettings]);
    } else {
      addSettings({
        id: 'default-settings',
        ...DEFAULT_SETTINGS,
        ...newSettings
      } as SystemSettings);
    }
  };

  return (
    <AppContext.Provider
      value={{
        vehicles,
        setVehicles,
        payments,
        setPayments,
        investors,
        setInvestors,
        drivers,
        setDrivers,
        settings,
        updateSettings,
        addVehicle,
        updateVehicle,
        addPayment,
        updatePayment,
        removePayment,
        addInvestor,
        updateInvestor,
        addDriver,
        updateDriver,
        validateVehicleData,
        validateInvestorData,
        validateDriverData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
